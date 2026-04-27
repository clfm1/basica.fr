import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTursoClient, authenticateToken, bcrypt, setCors } from "../_utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ error: "Access token required" });

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required" });
  }

  try {
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT password FROM users WHERE id = ?",
      args: [user.userId]
    });

    const userData = result.rows[0];
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, userData.password as string);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await client.execute({
      sql: "UPDATE users SET password = ? WHERE id = ?",
      args: [hashedPassword, user.userId]
    });

    res.json({ message: "Password updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
