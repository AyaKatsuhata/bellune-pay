import Stripe from "stripe";

export async function POST() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const YOUR_DOMAIN = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  console.log("✅ PRICE_ID:", process.env.STRIPE_PRICE_ID);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    });

    console.log("✅ PRICE_ID:", price);
    console.log("✅ BASE_URL:", YOUR_DOMAIN);
    console.log("✅ Created Stripe session:", session);
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}