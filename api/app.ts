import express from "express";
import { createClient } from "@libsql/client/web";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { Resend } from "resend";

// ── Environment ──────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "basico-secret-key-123";
let databaseReady: Promise<void> | null = null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function createRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getRequestId(req: any) {
  return req.requestId || "no-request-id";
}

function logInfo(reqOrId: any, message: string, details?: Record<string, unknown>) {
  const requestId = typeof reqOrId === "string" ? reqOrId : getRequestId(reqOrId);
  console.log(`[API:${requestId}] ${message}`, details || {});
}

function logError(reqOrId: any, message: string, error: unknown, details?: Record<string, unknown>) {
  const requestId = typeof reqOrId === "string" ? reqOrId : getRequestId(reqOrId);
  const normalized = error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { error };
  console.error(`[API:${requestId}] ${message}`, { ...normalized, ...(details || {}) });
}

// ── Stripe (lazy) ────────────────────────────────────────────────────────────
let stripe: Stripe | null = null;
function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY environment variable is required");
    console.log("[API:stripe] Creating Stripe client", { keyPrefix: key.slice(0, 7), hasKey: !!key });
    stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" as any });
  }
  return stripe;
}

// ── Turso (lazy) ─────────────────────────────────────────────────────────────
let tursoClient: any = null;
function getTursoClient() {
  if (!tursoClient) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url) throw new Error("TURSO_DATABASE_URL environment variable is required");
    console.log("[API:turso] Creating Turso client", {
      hasUrl: !!url,
      urlPrefix: url ? url.slice(0, 24) : null,
      hasAuthToken: !!authToken,
    });
    tursoClient = createClient({ url, authToken });
  }
  return tursoClient;
}

async function ensureDatabase() {
  if (!databaseReady) {
    databaseReady = (async () => {
      console.log("[API:db] ensureDatabase start");
      const client = getTursoClient();
      const addColumnIfMissing = async (sql: string) => {
        try {
          await client.execute(sql);
        } catch (error: any) {
          if (!String(error.message || error).includes("duplicate column name")) {
            throw error;
          }
        }
      };

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
      await addColumnIfMissing("ALTER TABLE users ADD COLUMN reset_token TEXT");
      await addColumnIfMissing("ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME");
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
      console.log("[API:db] ensureDatabase success");
    })().catch((error) => {
      databaseReady = null;
      console.error("[API:db] ensureDatabase failed", error);
      throw error;
    });
  }

  await databaseReady;
}

// ── Nodemailer ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "authsmtp.amen.fr",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  tls: { rejectUnauthorized: false },
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to: string, subject: string, text: string, html: string) {
  if (resend) {
    console.log("[API:email] Sending email with Resend", { to, subject, from: process.env.RESEND_FROM || process.env.SMTP_FROM || "Basica <no-reply@basica.fr>" });
    await resend.emails.send({
      from: process.env.RESEND_FROM || process.env.SMTP_FROM || "Basica <no-reply@basica.fr>",
      to,
      subject,
      text,
      html,
    });
    return;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL] Simulated email to ${to}: ${subject}`);
    return;
  }
  console.log("[API:email] Sending email with SMTP", { to, subject, host: process.env.SMTP_HOST, user: process.env.SMTP_USER });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"My App" <no-reply@example.com>',
    to,
    subject,
    text,
    html,
  });
}

// ── Auth middleware ──────────────────────────────────────────────────────────
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// ── Express app ─────────────────────────────────────────────────────────────
const app = express();
app.use((req: any, res, next) => {
  req.requestId = createRequestId();
  const startedAt = Date.now();
  logInfo(req, "Incoming request", {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    host: req.headers.host,
    origin: req.headers.origin,
    contentType: req.headers["content-type"],
    userAgent: req.headers["user-agent"],
    hasAuthorization: !!req.headers.authorization,
  });
  res.setHeader("x-basica-request-id", req.requestId);
  res.on("finish", () => {
    logInfo(req, "Request finished", {
      method: req.method,
      originalUrl: req.originalUrl,
      finalUrl: req.url,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
  next();
});
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      if (req.url.includes("/webhooks/stripe")) {
        req.rawBody = buf;
      }
    },
  })
);
app.use((req, _res, next) => {
  const beforeUrl = req.url;
  if (req.url === "/api") {
    req.url = "/";
  } else if (req.url.startsWith("/api/")) {
    req.url = req.url.slice(4);
  }
  if (beforeUrl !== req.url) {
    logInfo(req, "Normalized API path", { beforeUrl, afterUrl: req.url });
  }
  next();
});

// ── Health / Debug ──────────────────────────────────────────────────────────
app.get("/test", (_req, res) => {
  logInfo(_req, "Test endpoint hit");
  res.json({ message: "Test successful" });
});

app.get("/health", (_req, res) => {
  logInfo(_req, "Health endpoint hit");
  res.json({ status: "ok" });
});

app.get("/db-status", async (_req, res) => {
  try {
    logInfo(_req, "DB status check start");
    const client = getTursoClient();
    await client.execute("SELECT 1");
    logInfo(_req, "DB status check success");
    res.json({ status: "connected", database: "turso" });
  } catch (error: any) {
    logError(_req, "DB status check failed", error);
    res.status(500).json({ status: "error", message: error.message, requestId: getRequestId(_req) });
  }
});

// ── Debug: check env vars (remove after debugging) ──────────────────────────
app.get("/debug-env", (_req, res) => {
  logInfo(_req, "Debug env endpoint hit");
  res.json({
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    hasTursoAuth: !!process.env.TURSO_AUTH_TOKEN,
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasSmtpHost: !!process.env.SMTP_HOST,
    hasSmtpUser: !!process.env.SMTP_USER,
    hasSmtpPass: !!process.env.SMTP_PASS,
    hasResendApiKey: !!process.env.RESEND_API_KEY,
    hasResendFrom: !!process.env.RESEND_FROM,
    hasStripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
  });
});

// ── DB Init ─────────────────────────────────────────────────────────────────
app.post("/db/init", async (_req, res) => {
  try {
    logInfo(_req, "DB init endpoint hit");
    await ensureDatabase();
    logInfo(_req, "DB init endpoint success");
    res.json({ message: "Database initialized successfully" });
  } catch (error: any) {
    logError(_req, "DB init endpoint failed", error);
    res.status(500).json({ error: error.message, requestId: getRequestId(_req) });
  }
});

// ── Auth: Register ──────────────────────────────────────────────────────────
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  logInfo(req, "Register attempt", { email, hasPassword: !!password });
  if (!email || !password) {
    logInfo(req, "Register missing fields", { email, hasPassword: !!password });
    return res.status(400).json({ error: "Email and password are required", requestId: getRequestId(req) });
  }

  try {
    logInfo(req, "Register ensure database");
    await ensureDatabase();
    const client = getTursoClient();
    logInfo(req, "Register hashing password", { email });
    const hashedPassword = await bcrypt.hash(password, 10);
    logInfo(req, "Register inserting user", { email });
    await client.execute({
      sql: "INSERT INTO users (email, password) VALUES (?, ?)",
      args: [email, hashedPassword],
    });
    logInfo(req, "Register success", { email });
    res.status(201).json({ message: "User registered successfully", requestId: getRequestId(req) });
  } catch (error: any) {
    logError(req, "Register failed", error, { email });
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "Email already exists", requestId: getRequestId(req) });
    }
    res.status(500).json({ error: `Registration error: ${error.message}`, requestId: getRequestId(req) });
  }
});

// ── Auth: Login ─────────────────────────────────────────────────────────────
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  logInfo(req, "Login attempt", { email, hasPassword: !!password });
  if (!email || !password) {
    logInfo(req, "Login missing fields", { email, hasPassword: !!password });
    return res.status(400).json({ error: "Email and password are required", requestId: getRequestId(req) });
  }

  try {
    logInfo(req, "Login ensure database");
    await ensureDatabase();
    const client = getTursoClient();
    logInfo(req, "Login selecting user", { email });
    const result = await client.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email],
    });

    const user = result.rows[0];
    if (!user) {
      logInfo(req, "Login user not found", { email });
      return res.status(401).json({ error: "Invalid credentials", requestId: getRequestId(req) });
    }

    logInfo(req, "Login comparing password", { email, userId: user.id });
    const isPasswordValid = await bcrypt.compare(password, user.password as string);
    if (!isPasswordValid) {
      logInfo(req, "Login invalid password", { email, userId: user.id });
      return res.status(401).json({ error: "Invalid credentials", requestId: getRequestId(req) });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    logInfo(req, "Login success", { email, userId: user.id });
    res.json({ token, user: { id: user.id, email: user.email }, requestId: getRequestId(req) });
  } catch (error: any) {
    logError(req, "Login failed", error, { email });
    res.status(500).json({ error: error.message, requestId: getRequestId(req) });
  }
});

// ── Auth: Forgot password ───────────────────────────────────────────────────
app.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    await ensureDatabase();
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });

    if (result.rows.length === 0) {
      return res.json({ message: "Si cet email existe dans notre base, un lien de réinitialisation a été envoyé." });
    }

    const userId = result.rows[0].id;
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiry = new Date(Date.now() + 3600000);

    await client.execute({
      sql: "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
      args: [resetToken, expiry.toISOString(), userId],
    });

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

// ── Auth: Reset password ────────────────────────────────────────────────────
app.post("/auth/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: "Token and new password are required" });

  try {
    await ensureDatabase();
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > ?",
      args: [token, new Date().toISOString()],
    });

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Lien de réinitialisation invalide ou expiré." });
    }

    const userId = result.rows[0].id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await client.execute({
      sql: "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      args: [hashedPassword, userId],
    });

    res.json({ message: "Votre mot de passe a été réinitialisé avec succès !" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── User: Stats ─────────────────────────────────────────────────────────────
app.get("/user/stats", authenticateToken, async (req: any, res) => {
  try {
    await ensureDatabase();
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT COUNT(*) as count FROM acquisitions WHERE user_id = ?",
      args: [req.user.userId],
    });
    const orderCount = result.rows[0]?.count || 0;
    res.json({ orderCount, activeLicenses: orderCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── User: Orders ────────────────────────────────────────────────────────────
app.get("/user/orders", authenticateToken, async (req: any, res) => {
  try {
    await ensureDatabase();
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT * FROM acquisitions WHERE user_id = ? ORDER BY created_at DESC",
      args: [req.user.userId],
    });
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── User: Licenses ──────────────────────────────────────────────────────────
app.get("/user/licenses", authenticateToken, async (req: any, res) => {
  try {
    await ensureDatabase();
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT * FROM licenses WHERE user_id = ? ORDER BY created_at DESC",
      args: [req.user.userId],
    });
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── User: Addresses ─────────────────────────────────────────────────────────
app.get("/user/addresses", authenticateToken, async (req: any, res) => {
  try {
    await ensureDatabase();
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC",
      args: [req.user.userId],
    });
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/user/addresses", authenticateToken, async (req: any, res) => {
  const { first_name, last_name, street, city, zip, country } = req.body;
  try {
    await ensureDatabase();
    const client = getTursoClient();
    await client.execute({
      sql: "INSERT INTO addresses (user_id, first_name, last_name, street, city, zip, country) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [req.user.userId, first_name, last_name, street, city, zip, country],
    });
    res.json({ message: "Address saved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── User: Change password ───────────────────────────────────────────────────
app.post("/user/change-password", authenticateToken, async (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required" });
  }

  try {
    await ensureDatabase();
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT password FROM users WHERE id = ?",
      args: [req.user.userId],
    });

    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password as string);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await client.execute({
      sql: "UPDATE users SET password = ? WHERE id = ?",
      args: [hashedPassword, req.user.userId],
    });

    res.json({ message: "Password updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── Stripe: Create checkout session ─────────────────────────────────────────
app.post("/create-checkout-session", async (req: any, res) => {
  const { productId, productName, price, userEmail } = req.body;
  logInfo(req, "Stripe checkout attempt", { productId, productName, price, userEmail });

  try {
    const stripeClient = getStripe();
    const origin = req.headers.origin || "https://basica.fr";

    logInfo(req, "Creating Stripe session", { productId, productName, price, userEmail, origin });

    const session = await stripeClient.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: productName },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/my-account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/${productId}`,
      customer_email: userEmail,
      metadata: { productId, productName },
    });

    logInfo(req, "Stripe session created", { sessionId: session.id, hasUrl: !!session.url });
    res.json({ id: session.id, url: session.url, requestId: getRequestId(req) });
  } catch (error: any) {
    logError(req, "Stripe checkout failed", error, { productId, productName, price, userEmail });
    res.status(500).json({ error: error.message, requestId: getRequestId(req) });
  }
});

// ── Stripe: Webhook ─────────────────────────────────────────────────────────
app.post("/webhooks/stripe", async (req: any, res) => {
  const sig = req.headers["stripe-signature"] as string;
  logInfo(req, "Stripe webhook received", { hasSignature: !!sig });
  const stripeClient = getStripe();
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(req.rawBody || req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err: any) {
    logError(req, "Stripe webhook verification failed", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  logInfo(req, "Stripe webhook verified", { eventType: event.type });
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;
    const userEmail = session.customer_email;

    if (metadata && userEmail) {
      try {
        const client = getTursoClient();
        await ensureDatabase();
        const userResult = await client.execute({
          sql: "SELECT id FROM users WHERE email = ?",
          args: [userEmail],
        });
        const userId = userResult.rows[0]?.id;

        if (userId) {
          logInfo(req, "Stripe webhook fulfilling order", { userEmail, userId, productId: metadata.productId });
          await client.execute({
            sql: "INSERT INTO acquisitions (user_id, product_id, product_name, preview_url) VALUES (?, ?, ?, ?)",
            args: [userId, metadata.productId, metadata.productName, "https://example.com/preview"],
          });
          const licenseKey = `LIC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          await client.execute({
            sql: "INSERT INTO licenses (user_id, product_id, product_name, license_key) VALUES (?, ?, ?, ?)",
            args: [userId, metadata.productId, metadata.productName, licenseKey],
          });
          logInfo(req, "Stripe webhook order fulfilled", { userEmail, userId });
        } else {
          logInfo(req, "Stripe webhook user not found", { userEmail });
        }
      } catch (error) {
        logError(req, "Failed to fulfill order via webhook", error, { userEmail });
      }
    }
  }

  res.json({ received: true, requestId: getRequestId(req) });
});

// ── Catch-all for debugging ─────────────────────────────────────────────────
app.use((req, res) => {
  logInfo(req, "Unmatched route", { method: req.method, path: req.url, originalUrl: req.originalUrl });
  res.status(404).json({ error: "Route not found", method: req.method, path: req.url, requestId: getRequestId(req) });
});

app.use((err: any, req: any, res: any, _next: any) => {
  logError(req, "Unhandled Express error", err);
  res.status(500).json({ error: err?.message || "Internal server error", requestId: getRequestId(req) });
});

export default app;
