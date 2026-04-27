import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTursoClient, authenticateToken, setCors } from "../_utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ error: "Access token required" });

  try {
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT * FROM acquisitions WHERE user_id = ? ORDER BY created_at DESC",
      args: [user.userId]
    });
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
