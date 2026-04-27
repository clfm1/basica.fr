import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTursoClient, authenticateToken, setCors } from "../_utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ error: "Access token required" });

  try {
    const client = getTursoClient();

    if (req.method === "GET") {
      const result = await client.execute({
        sql: "SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC",
        args: [user.userId]
      });
      return res.json(result.rows);
    }

    if (req.method === "POST") {
      const { first_name, last_name, street, city, zip, country } = req.body;
      await client.execute({
        sql: "INSERT INTO addresses (user_id, first_name, last_name, street, city, zip, country) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [user.userId, first_name, last_name, street, city, zip, country]
      });
      return res.json({ message: "Address saved successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
