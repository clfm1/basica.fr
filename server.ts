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
const ADMIN_EMAIL = "calofadam16@gmail.com";

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

  app.use(express.json({
    verify: (req: any, _res, buf) => {
      if (req.url.includes("/webhooks/stripe")) {
        req.rawBody = buf;
      }
    },
  }));

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
        (req as any).rawBody || req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      try {
        const result = await fulfillCheckoutSession(session);
        console.log("Stripe webhook fulfillment result", result);
      } catch (error) {
        console.error("Failed to fulfill order via webhook", error);
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

  function formatEuroFromSession(session: Stripe.Checkout.Session) {
    const amount = session.amount_total;
    if (typeof amount !== "number") return "";
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount / 100);
  }

  async function sendOrderConfirmationEmail(to: string, productName: string, session: Stripe.Checkout.Session) {
    const price = formatEuroFromSession(session);
    const accountUrl = `${session.success_url || ""}`.split("?")[0] || "http://localhost:3000/my-account";
    const subject = "Commande confirmée - Basico";
    const text = [
      "Félicitations, votre commande est bien passée.",
      "",
      `Produit : ${productName}`,
      price ? `Montant : ${price}` : "",
      "",
      "Votre produit est en cours de préparation et arrive bientôt dans votre espace client.",
      `Suivi de commande : ${accountUrl}`,
    ].filter(Boolean).join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;background:#080307;color:#ffffff;padding:28px;border-radius:18px">
        <h1 style="margin:0 0 12px;color:#f97316">Félicitations !</h1>
        <p style="margin:0 0 18px;color:#d4d4d8">Votre commande est bien passée.</p>
        <div style="background:#120c0d;border:1px solid #2a1710;border-radius:14px;padding:18px;margin:18px 0">
          <p style="margin:0 0 8px;color:#a1a1aa">Produit</p>
          <p style="margin:0;font-size:18px;font-weight:700">${productName}</p>
          ${price ? `<p style="margin:12px 0 0;color:#f97316;font-weight:700">${price}</p>` : ""}
        </div>
        <p style="color:#d4d4d8">Votre produit est en cours de préparation et arrive bientôt dans votre espace client.</p>
        <a href="${accountUrl}" style="display:inline-block;margin-top:14px;background:#ea580c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">Voir mon compte</a>
      </div>
    `;

    await sendEmail(to, subject, text, html);
  }

  async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
    if (session.payment_status !== "paid") {
      return { fulfilled: false, reason: "Session is not paid" };
    }

    const productId = session.metadata?.productId;
    const productName = session.metadata?.productName;
    const userEmail = session.customer_email || session.customer_details?.email;

    if (!productId || !productName || !userEmail) {
      return { fulfilled: false, reason: "Missing product or customer metadata" };
    }

    const client = getTursoClient();
    const existing = await client.execute({
      sql: "SELECT id FROM acquisitions WHERE stripe_session_id = ? LIMIT 1",
      args: [session.id]
    });

    if (existing.rows.length > 0) {
      return { fulfilled: true, alreadyFulfilled: true };
    }

    const userResult = await client.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [userEmail]
    });
    const userId = userResult.rows[0]?.id;

    if (userId) {
      await client.execute({
        sql: "INSERT INTO acquisitions (user_id, product_id, product_name, preview_url, stripe_session_id) VALUES (?, ?, ?, ?, ?)",
        args: [userId, productId, productName, "Commande confirmée", session.id]
      });

      const licenseKey = `CMD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      await client.execute({
        sql: "INSERT INTO licenses (user_id, product_id, product_name, license_key, stripe_session_id) VALUES (?, ?, ?, ?, ?)",
        args: [userId, productId, productName, licenseKey, session.id]
      });
    }

    try {
      await sendOrderConfirmationEmail(userEmail, productName, session);
    } catch (error) {
      console.error("Order confirmation email failed", error);
    }

    return { fulfilled: true, hasAccount: !!userId };
  }

  async function getPaidStripeOrdersByEmail(email?: string) {
    if (!process.env.STRIPE_SECRET_KEY) return [];

    const stripeClient = getStripe();
    const sessions = await stripeClient.checkout.sessions.list({ limit: 100 });

    return sessions.data
      .filter((session) => session.payment_status === "paid")
      .filter((session) => {
        const sessionEmail = session.customer_email || session.customer_details?.email || "";
        return email ? sessionEmail.toLowerCase() === email.toLowerCase() : !!sessionEmail;
      })
      .map((session) => ({
        id: session.id,
        product_id: session.metadata?.productId || "",
        product_name: session.metadata?.productName || "Commande Stripe",
        created_at: new Date(session.created * 1000).toISOString(),
        total: typeof session.amount_total === "number" ? session.amount_total / 100 : null,
        status: session.payment_status,
        customer_email: session.customer_email || session.customer_details?.email || "",
        source: "stripe",
      }));
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
          stripe_session_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);
      try { await client.execute("ALTER TABLE acquisitions ADD COLUMN stripe_session_id TEXT"); } catch {}
      await client.execute(`
        CREATE TABLE IF NOT EXISTS licenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          license_key TEXT NOT NULL,
          stripe_session_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);
      try { await client.execute("ALTER TABLE licenses ADD COLUMN stripe_session_id TEXT"); } catch {}
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

  const requireAdmin = (req: any, res: any, next: any) => {
    if (String(req.user?.email || "").toLowerCase() !== ADMIN_EMAIL) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
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

  app.get("/api/admin/customers", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const client = getTursoClient();
      const result = await client.execute(`
        SELECT
          users.id,
          users.email,
          users.created_at,
          COUNT(acquisitions.id) AS order_count,
          MAX(acquisitions.created_at) AS last_order_at
        FROM users
        INNER JOIN acquisitions ON acquisitions.user_id = users.id
        GROUP BY users.id, users.email, users.created_at
        ORDER BY last_order_at DESC
      `);
      const customers = new Map<string, any>();

      for (const row of result.rows) {
        const email = String(row.email || "").toLowerCase();
        customers.set(email, {
          id: email,
          email: row.email,
          created_at: row.created_at,
          order_count: Number(row.order_count || 0),
          last_order_at: row.last_order_at,
          sources: ["account"],
        });
      }

      const stripeOrders = await getPaidStripeOrdersByEmail();
      for (const order of stripeOrders) {
        const email = String(order.customer_email || "").toLowerCase();
        const stripeOrderCount = stripeOrders.filter((item) => item.customer_email.toLowerCase() === email).length;
        const existing = customers.get(email);
        if (existing) {
          existing.order_count = Math.max(existing.order_count, stripeOrderCount);
          existing.last_order_at = existing.last_order_at && existing.last_order_at > order.created_at ? existing.last_order_at : order.created_at;
          if (!existing.sources.includes("stripe")) existing.sources.push("stripe");
        } else {
          customers.set(email, {
            id: email,
            email: order.customer_email,
            created_at: null,
            order_count: stripeOrderCount,
            last_order_at: order.created_at,
            sources: ["stripe"],
          });
        }
      }

      res.json(Array.from(customers.values()).sort((a, b) => String(b.last_order_at || "").localeCompare(String(a.last_order_at || ""))));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/customers/:email/orders", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const client = getTursoClient();
      const email = decodeURIComponent(req.params.email);
      const result = await client.execute({
        sql: `
          SELECT acquisitions.*, users.email AS customer_email, 'account' AS source
          FROM acquisitions
          INNER JOIN users ON users.id = acquisitions.user_id
          WHERE lower(users.email) = lower(?)
          ORDER BY acquisitions.created_at DESC
        `,
        args: [email]
      });
      const stripeOrders = await getPaidStripeOrdersByEmail(email);
      const orders = [...result.rows, ...stripeOrders]
        .filter((order: any, index, all) => {
          const stripeSessionId = order.stripe_session_id || order.id;
          return all.findIndex((item: any) => (item.stripe_session_id || item.id) === stripeSessionId) === index;
        })
        .sort((a: any, b: any) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/send-email", authenticateToken, requireAdmin, async (req: any, res) => {
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) {
      return res.status(400).json({ error: "Destinataire, sujet et message requis" });
    }

    try {
      const safeMessage = String(message).replace(/\n/g, "<br />");
      await sendEmail(
        to,
        subject,
        message,
        `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><p>${safeMessage}</p></div>`
      );
      res.json({ message: "Email envoyé" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/create-checkout-session", async (req: any, res) => {
    const { productId, productName, price, finalPrice, promoCode, userEmail } = req.body;
    const checkoutPrice = Number.isFinite(Number(finalPrice)) ? Number(finalPrice) : Number(price);
    
    try {
      const stripeClient = getStripe();
      const origin = req.headers.origin || "http://localhost:3000";
      
      console.log(`Creating Stripe session for ${userEmail} - Product: ${productName} - Price: ${checkoutPrice}`);

      const session = await stripeClient.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: productName,
              },
              unit_amount: Math.round(checkoutPrice * 100),
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
          promoCode: promoCode || "",
        }
      });

      console.log(`Stripe session created: ${session.id} - URL: ${session.url}`);
      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe Session Creation Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/confirm-checkout-session", authenticateToken, async (req: any, res) => {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "Session Stripe manquante" });
    }

    try {
      const stripeClient = getStripe();
      const session = await stripeClient.checkout.sessions.retrieve(sessionId);
      const sessionEmail = session.customer_email || session.customer_details?.email;

      if (!sessionEmail || sessionEmail !== req.user.email) {
        return res.status(403).json({ error: "Cette commande n'est pas liée à ce compte" });
      }

      const result = await fulfillCheckoutSession(session);
      if (!result.fulfilled) {
        return res.status(400).json({ error: result.reason || "Commande non confirmée" });
      }

      res.json({ message: "Commande confirmée", ...result });
    } catch (error: any) {
      console.error("Stripe checkout confirmation failed", error);
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

// Only listen during local development.
if (process.env.NODE_ENV !== 'production') {
  startServer().then((app) => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

// Export for local tooling.
export default startServer;
