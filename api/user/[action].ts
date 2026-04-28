import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTursoClient, authenticateToken, bcrypt, setCors, ensureSchema, readJsonBody, getErrorMessage } from "../_utils";

type AddressBody = {
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
};

type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

async function handleStats(req: VercelRequest, res: VercelResponse, userId: number) {
  await ensureSchema();
  const client = getTursoClient();
  const result = await client.execute({
    sql: "SELECT COUNT(*) as count FROM acquisitions WHERE user_id = ?",
    args: [userId]
  });
  const orderCount = result.rows[0]?.count || 0;
  res.json({ orderCount, activeLicenses: orderCount });
}

async function handleOrders(req: VercelRequest, res: VercelResponse, userId: number) {
  await ensureSchema();
  const client = getTursoClient();
  const result = await client.execute({
    sql: "SELECT * FROM acquisitions WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId]
  });
  res.json(result.rows);
}

async function handleLicenses(req: VercelRequest, res: VercelResponse, userId: number) {
  await ensureSchema();
  const client = getTursoClient();
  const result = await client.execute({
    sql: "SELECT * FROM licenses WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId]
  });
  res.json(result.rows);
}

async function handleAddresses(req: VercelRequest, res: VercelResponse, userId: number) {
  await ensureSchema();
  const client = getTursoClient();

  if (req.method === "GET") {
    const result = await client.execute({
      sql: "SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC",
      args: [userId]
    });
    return res.json(result.rows);
  }

  if (req.method === "POST") {
    const { first_name, last_name, street, city, zip, country } = readJsonBody<AddressBody>(req);
    await client.execute({
      sql: "INSERT INTO addresses (user_id, first_name, last_name, street, city, zip, country) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [userId, first_name, last_name, street, city, zip, country]
    });
    return res.json({ message: "Address saved successfully" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleChangePassword(req: VercelRequest, res: VercelResponse, userId: number) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { currentPassword, newPassword } = readJsonBody<ChangePasswordBody>(req);
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required" });
  }

  await ensureSchema();
  const client = getTursoClient();
  const result = await client.execute({
    sql: "SELECT password FROM users WHERE id = ?",
    args: [userId]
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
    args: [hashedPassword, userId]
  });

  res.json({ message: "Password updated successfully" });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ error: "Access token required" });

  const { action } = req.query;

  try {
    switch (action) {
      case "stats":
        return handleStats(req, res, user.userId);
      case "orders":
        return handleOrders(req, res, user.userId);
      case "licenses":
        return handleLicenses(req, res, user.userId);
      case "addresses":
        return handleAddresses(req, res, user.userId);
      case "change-password":
        return handleChangePassword(req, res, user.userId);
      default:
        return res.status(404).json({ error: "Not found" });
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("[USER] Handler failed:", message, error);
    res.status(500).json({ error: message });
  }
}
