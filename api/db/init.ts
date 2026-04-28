import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureSchema, setCors } from "../_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await ensureSchema();
    res.json({ message: "Database initialized successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
