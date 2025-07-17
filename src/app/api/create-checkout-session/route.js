import Stripe from "stripe";

export async function POST() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const YOUR_DOMAIN = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email_collection: {
         enabled: true
      },
      payment_method_types: ['card'],
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

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
