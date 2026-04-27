import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTursoClient, getStripe, setCors } from "../_utils.js";
import Stripe from "stripe";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const sig = req.headers['stripe-signature'] as string;
  const stripeClient = getStripe();

  let event;
  try {
    // For Vercel, req.body is already parsed. We need the raw body.
    // Vercel passes raw body as a Buffer when the content-type is application/json
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    event = stripeClient.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;
    const userEmail = session.customer_email;

    if (metadata && userEmail) {
      try {
        const client = getTursoClient();
        const userResult = await client.execute({
          sql: "SELECT id FROM users WHERE email = ?",
          args: [userEmail]
        });
        const userId = userResult.rows[0]?.id;

        if (userId) {
          await client.execute({
            sql: "INSERT INTO acquisitions (user_id, product_id, product_name, preview_url) VALUES (?, ?, ?, ?)",
            args: [userId, metadata.productId, metadata.productName, "https://example.com/preview"]
          });

          const licenseKey = `LIC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          await client.execute({
            sql: "INSERT INTO licenses (user_id, product_id, product_name, license_key) VALUES (?, ?, ?, ?)",
            args: [userId, metadata.productId, metadata.productName, licenseKey]
          });
          console.log(`Order fulfilled for ${userEmail}`);
        }
      } catch (error) {
        console.error("Failed to fulfill order via webhook", error);
      }
    }
  }

  res.json({ received: true });
}
