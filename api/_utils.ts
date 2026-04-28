import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const JWT_SECRET = process.env.JWT_SECRET || "basico-secret-key-123";

// Turso client (singleton)
let tursoClient: any = null;
export function getTursoClient() {
  if (!tursoClient) {
    console.log("[DB] Initializing Turso client...");
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    
    if (!url) {
      console.error("[DB] CRITICAL ERROR: TURSO_DATABASE_URL is missing!");
      throw new Error("TURSO_DATABASE_URL environment variable is required");
    }
    
    try {
      tursoClient = createClient({
        url: url,
        authToken: authToken,
      });
      console.log("[DB] Turso client initialized successfully.");
    } catch (e: any) {
      console.error("[DB] CRITICAL ERROR: Failed to create client!", e);
      throw e;
    }
  }
  return tursoClient;
}

let schemaEnsured = false;

export async function ensureSchema() {
  if (schemaEnsured) return;

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

  try {
    await client.execute("ALTER TABLE users ADD COLUMN reset_token TEXT");
  } catch {}

  try {
    await client.execute("ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME");
  } catch {}

  schemaEnsured = true;
}

// Stripe client (singleton)
let stripe: Stripe | null = null;
export function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" as any });
  }
  return stripe;
}

// Email transporter (lazy-initialized to avoid module-load errors)
let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "authsmtp.amen.fr",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, text: string, html: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log(`[EMAIL] Simulated email to ${to}: ${subject}`);
    return;
  }
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || '"My App" <no-reply@example.com>',
    to,
    subject,
    text,
    html,
  });
}

// JWT Authentication helper
export function authenticateToken(req: VercelRequest): { userId: number; email: string } | null {
  const authHeader = req.headers['authorization'];
  const token = authHeader && (authHeader as string).split(' ')[1];

  if (!token) return null;

  try {
    const user = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    return user;
  } catch {
    return null;
  }
}

// Helper to sign JWT
export function signToken(payload: { userId: any; email: any }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// CORS helper
export function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export { bcrypt };
