import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTursoClient, bcrypt, signToken, sendEmail, setCors } from "../_utils.js";

async function handleLogin(req: VercelRequest, res: VercelResponse) {
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

    const token = signToken({ userId: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

async function handleRegister(req: VercelRequest, res: VercelResponse) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const client = getTursoClient();
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.execute({
      sql: "INSERT INTO users (email, password) VALUES (?, ?)",
      args: [email, hashedPassword]
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: error.message });
  }
}

async function handleForgotPassword(req: VercelRequest, res: VercelResponse) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

async function handleResetPassword(req: VercelRequest, res: VercelResponse) {
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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action } = req.query;

  switch (action) {
    case "login":
      return handleLogin(req, res);
    case "register":
      return handleRegister(req, res);
    case "forgot-password":
      return handleForgotPassword(req, res);
    case "reset-password":
      return handleResetPassword(req, res);
    default:
      return res.status(404).json({ error: "Not found" });
  }
}
