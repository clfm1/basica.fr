import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe, setCors } from "./_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { productId, productName, price, userEmail } = req.body;

  try {
    const stripeClient = getStripe();
    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || "https://basica.fr";

    console.log(`Creating Stripe session for ${userEmail} - Product: ${productName} - Price: ${price}`);

    const session = await stripeClient.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: productName,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/my-account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/${productId}`,
      customer_email: userEmail,
      metadata: {
        productId,
        productName,
      }
    });

    console.log(`Stripe session created: ${session.id} - URL: ${session.url}`);
    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe Session Creation Error:", error);
    res.status(500).json({ error: error.message });
  }
}
