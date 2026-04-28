import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTursoClient, bcrypt, signToken, sendEmail, setCors, ensureSchema, readJsonBody, getErrorMessage } from "../_utils";

type LoginBody = { email: string; password: string };
type ForgotPasswordBody = { email: string };
type ResetPasswordBody = { token: string; newPassword: string };

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  const { email, password } = readJsonBody<LoginBody>(req);
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    await ensureSchema();
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

    const token = signToken({ userId: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("[AUTH] Login failed:", message, error);
    res.status(500).json({ error: message });
  }
}

async function handleRegister(req: VercelRequest, res: VercelResponse) {
  const { email, password } = readJsonBody<LoginBody>(req);
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    await ensureSchema();
    const client = getTursoClient();
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.execute({
      sql: "INSERT INTO users (email, password) VALUES (?, ?)",
      args: [email, hashedPassword]
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("[AUTH] Register failed:", message, error);
    if (message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: message });
  }
}

async function handleForgotPassword(req: VercelRequest, res: VercelResponse) {
  const { email } = readJsonBody<ForgotPasswordBody>(req);
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    await ensureSchema();
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email]
    });

    if (result.rows.length === 0) {
      return res.json({ message: "Si cet email existe dans notre base, un lien de réinitialisation a été envoyé." });
    }

    const userId = result.rows[0].id;
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiry = new Date(Date.now() + 3600000);

    await client.execute({
      sql: "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
      args: [resetToken, expiry.toISOString(), userId]
    });

    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || "https://basica.fr";

    await sendEmail(
      email,
      "Réinitialisation de votre mot de passe",
      `Cliquez sur ce lien pour réinitialiser votre mot de passe: ${origin}/my-account?token=${resetToken}`,
      `<p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe:</p><a href="${origin}/my-account?token=${resetToken}">Réinitialiser mon mot de passe</a>`
    );

    res.json({ message: "Un email a été envoyé avec les instructions pour réinitialiser votre mot de passe." });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("[AUTH] Forgot password failed:", message, error);
    res.status(500).json({ error: message });
  }
}

async function handleResetPassword(req: VercelRequest, res: VercelResponse) {
  const { token, newPassword } = readJsonBody<ResetPasswordBody>(req);
  if (!token || !newPassword) return res.status(400).json({ error: "Token and new password are required" });

  try {
    await ensureSchema();
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
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("[AUTH] Reset password failed:", message, error);
    res.status(500).json({ error: message });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`[AUTH] Incoming request: ${req.method} /api/auth/${req.query.action}`);
  
  try {
    setCors(res);
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { action } = req.query;
    console.log(`[AUTH] Action resolved: ${action}`);
    console.log("[AUTH] Request metadata:", {
      contentType: req.headers["content-type"],
      hasBody: Boolean(req.body),
      bodyType: typeof req.body,
    });

    switch (action) {
      case "login":
        console.log(`[AUTH] Executing handleLogin...`);
        return await handleLogin(req, res);
      case "register":
        console.log(`[AUTH] Executing handleRegister...`);
        return await handleRegister(req, res);
      case "forgot-password":
        console.log(`[AUTH] Executing handleForgotPassword...`);
        return await handleForgotPassword(req, res);
      case "reset-password":
        console.log(`[AUTH] Executing handleResetPassword...`);
        return await handleResetPassword(req, res);
      default:
        console.log(`[AUTH] Action not found: ${action}`);
        return res.status(404).json({ error: "Not found" });
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error(`[AUTH] FATAL ERROR IN HANDLER:`, error);
    return res.status(500).json({ 
      error: "Internal Server Error", 
      message,
    });
  }
}
