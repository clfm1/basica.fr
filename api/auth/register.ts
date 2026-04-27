import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTursoClient, bcrypt, setCors } from "../_utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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
