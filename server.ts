import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import nodemailer from "nodemailer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "basico-secret-key-123";

let stripe: Stripe | null = null;
function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" as any });
  }
  return stripe;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "authsmtp.amen.fr",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true, // true for port 465
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to: string, subject: string, text: string, html: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log(`[EMAIL] Simulated email to ${to}: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"My App" <no-reply@example.com>',
    to,
    subject,
    text,
    html,
  });
}

async function startServer() {
  console.log('[DEBUG] Starting server...');
  if (!process.env.TURSO_DATABASE_URL) {
    console.error('[ERROR] TURSO_DATABASE_URL is missing!');
  }
  console.log('[DEBUG] TURSO_DATABASE_URL exists:', !!process.env.TURSO_DATABASE_URL);
  
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/test", (req, res) => {
    res.json({ message: "Test successful" });
  });

  // Stripe Webhook needs raw body - MUST be before any other body parser
  app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const stripeClient = getStripe();
    let event;

    try {
      event = stripeClient.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;
      const userEmail = session.customer_email;

      if (metadata && userEmail) {
        try {
          const client = getTursoClient();
          // Find user by email
          const userResult = await client.execute({
            sql: "SELECT id FROM users WHERE email = ?",
            args: [userEmail]
          });
          const userId = userResult.rows[0]?.id;

          if (userId) {
            // Add acquisition
            await client.execute({
              sql: "INSERT INTO acquisitions (user_id, product_id, product_name, preview_url) VALUES (?, ?, ?, ?)",
              args: [userId, metadata.productId, metadata.productName, "https://example.com/preview"]
            });

            // Add license
            const licenseKey = `LIC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            await client.execute({
              sql: "INSERT INTO licenses (user_id, product_id, product_name, license_key) VALUES (?, ?, ?, ?)",
              args: [userId, metadata.productId, metadata.productName, licenseKey]
            });
            console.log(`Order fulfilled for ${userEmail}`);
          }
        } catch (error) {
          console.error("Failed to fulfill order via webhook", error);
        }
      }
    }

    res.json({ received: true });
  });

  // Turso client lazy initialization
  let tursoClient: any = null;
  function getTursoClient() {
    if (!tursoClient) {
      const url = process.env.TURSO_DATABASE_URL;
      const authToken = process.env.TURSO_AUTH_TOKEN;
      if (!url) {
        throw new Error("TURSO_DATABASE_URL environment variable is required");
      }
      tursoClient = createClient({
        url: url,
        authToken: authToken,
      });
    }
    return tursoClient;
  }

  // NOTE: Migrations moved out of startServer invocation to avoid running on every request
  // Ideally, they should be run as a separate deployment step or a dedicated admin endpoint.
  // We'll leave them here but check if they've been run, or just wrap in a single try-catch
  // and log failures without crashing initialization if they are just schema updates.
  async function runMigrations() {
    try {
      const client = getTursoClient();
      await client.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT");
      await client.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry DATETIME");
    } catch (e) {
      console.warn('Migrations might have failed or already been applied', e);
    }
  }
  
  // We only run migrations if not in production, or perhaps always but do not crash.
  // Actually, for Netlify, we really shouldn't run them on every request.
  // runMigrations(); // <-- DANGEROUS to leave here.

  // API Initialization...
  // ... (rest of routes)

  // Initialize Database
  app.post("/api/db/init", async (req, res) => {
    try {
      const client = getTursoClient();
      await client.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          reset_token TEXT,
          reset_token_expiry DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      // ... rest of migrations
      await client.execute(`
        CREATE TABLE IF NOT EXISTS acquisitions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          preview_url TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);
      await client.execute(`
        CREATE TABLE IF NOT EXISTS licenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          license_key TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);
      await client.execute(`
        CREATE TABLE IF NOT EXISTS addresses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          first_name TEXT,
          last_name TEXT,
          street TEXT,
          city TEXT,
          zip TEXT,
          country TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);
      res.json({ message: "Database initialized successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const client = getTursoClient();
      console.log(`[AUTH] Registering user: ${email}`);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await client.execute({
        sql: "INSERT INTO users (email, password) VALUES (?, ?)",
        args: [email, hashedPassword]
      });
      console.log(`[AUTH] User registered successfully: ${email}`);

      res.status(201).json({ message: "User registered successfully" });
    } catch (error: any) {
      console.error(`[AUTH] Registration error for ${email}:`, error);
      if (error.message && error.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: `Registration error: ${error.message}` });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
      const client = getTursoClient();
      const result = await client.execute({
        sql: "SELECT id FROM users WHERE email = ?",
        args: [email]
      });

      if (result.rows.length === 0) {
        // Return success even if email doesn't exist for security
        return res.json({ message: "Si cet email existe dans notre base, un lien de réinitialisation a été envoyé." });
      }

      const userId = result.rows[0].id;
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiry = new Date(Date.now() + 3600000); // 1 hour

      await client.execute({
        sql: "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
        args: [resetToken, expiry.toISOString(), userId]
      });

      // Mock email sending
      console.log(`[AUTH] Password reset requested for ${email}`);
      console.log(`[AUTH] Reset Token: ${resetToken}`);
      console.log(`[AUTH] Reset Link: ${req.headers.origin}/my-account?token=${resetToken}`);
      
      await sendEmail(
        email,
        "Réinitialisation de votre mot de passe",
        `Cliquez sur ce lien pour réinitialiser votre mot de passe: ${req.headers.origin}/my-account?token=${resetToken}`,
        `<p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe:</p><a href="${req.headers.origin}/my-account?token=${resetToken}">Réinitialiser mon mot de passe</a>`
      );

      res.json({ message: "Un email a été envoyé avec les instructions pour réinitialiser votre mot de passe." });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "Token and new password are required" });

    try {
      const client = getTursoClient();
      const result = await client.execute({
        sql: "SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > ?",
        args: [token, new Date().toISOString()]
      });

      if (result.rows.length === 0) {
        return res.status(400).json({ error: "Lien de réinitialisation invalide ou expiré." });
      }

      const userId = result.rows[0].id;
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await client.execute({
        sql: "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
        args: [hashedPassword, userId]
      });

      res.json({ message: "Votre mot de passe a été réinitialisé avec succès !" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    console.log("Login API hit");
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const client = getTursoClient();
      const result = await client.execute({
        sql: "SELECT * FROM users WHERE email = ?",
        args: [email]
      });

      const user = result.rows[0];
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password as string);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, user: { id: user.id, email: user.email } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access token required" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid or expired token" });
      req.user = user;
      next();
    });
  };

  app.get("/api/user/stats", authenticateToken, async (req: any, res) => {
    try {
      const client = getTursoClient();
      const result = await client.execute({
        sql: "SELECT COUNT(*) as count FROM acquisitions WHERE user_id = ?",
        args: [req.user.userId]
      });
      const orderCount = result.rows[0]?.count || 0;
      res.json({ orderCount, activeLicenses: orderCount }); // For now same number
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/user/orders", authenticateToken, async (req: any, res) => {
    try {
      const client = getTursoClient();
      const result = await client.execute({
        sql: "SELECT * FROM acquisitions WHERE user_id = ? ORDER BY created_at DESC",
        args: [req.user.userId]
      });
      res.json(result.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/user/licenses", authenticateToken, async (req: any, res) => {
    try {
      const client = getTursoClient();
      const result = await client.execute({
        sql: "SELECT * FROM licenses WHERE user_id = ? ORDER BY created_at DESC",
        args: [req.user.userId]
      });
      res.json(result.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/user/addresses", authenticateToken, async (req: any, res) => {
    try {
      const client = getTursoClient();
      const result = await client.execute({
        sql: "SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC",
        args: [req.user.userId]
      });
      res.json(result.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/user/change-password", authenticateToken, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required" });
    }

    try {
      const client = getTursoClient();
      const result = await client.execute({
        sql: "SELECT password FROM users WHERE id = ?",
        args: [req.user.userId]
      });

      const user = result.rows[0];
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password as string);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await client.execute({
        sql: "UPDATE users SET password = ? WHERE id = ?",
        args: [hashedPassword, req.user.userId]
      });

      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/user/addresses", authenticateToken, async (req: any, res) => {
    const { first_name, last_name, street, city, zip, country } = req.body;
    try {
      const client = getTursoClient();
      await client.execute({
        sql: "INSERT INTO addresses (user_id, first_name, last_name, street, city, zip, country) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [req.user.userId, first_name, last_name, street, city, zip, country]
      });
      res.json({ message: "Address saved successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/create-checkout-session", async (req: any, res) => {
    const { productId, productName, price, userEmail } = req.body;
    
    try {
      const stripeClient = getStripe();
      const origin = req.headers.origin || "http://localhost:3000";
      
      console.log(`Creating Stripe session for ${userEmail} - Product: ${productName} - Price: ${price}`);

      const session = await stripeClient.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: productName,
              },
              unit_amount: Math.round(price * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/my-account?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout/${productId}`,
        customer_email: userEmail,
        metadata: {
          productId,
          productName,
        }
      });

      console.log(`Stripe session created: ${session.id} - URL: ${session.url}`);
      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe Session Creation Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/db-status", async (req, res) => {
    try {
      const client = getTursoClient();
      await client.execute("SELECT 1");
      res.json({ status: "connected", database: "turso" });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

// Only listen if not running as a Netlify function
if (!process.env.NETLIFY && process.env.NODE_ENV !== 'production') {
  startServer().then((app) => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

// Export for Netlify Functions to use
export default startServer;
