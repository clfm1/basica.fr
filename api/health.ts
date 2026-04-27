import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "./_utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  res.json({ status: "ok" });
}
