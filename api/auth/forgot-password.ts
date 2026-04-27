import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTursoClient, sendEmail, setCors } from "../_utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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

    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || "https://basica.fr";

    console.log(`[AUTH] Password reset requested for ${email}`);
    console.log(`[AUTH] Reset Token: ${resetToken}`);

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
