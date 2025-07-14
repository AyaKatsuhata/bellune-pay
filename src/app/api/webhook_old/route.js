import { NextResponse } from "next/server";
import Stripe from "stripe";
import * as line from "@line/bot-sdk";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// LINE SDK 初期化
const lineClient = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed.", err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    console.log("✅ Stripe Event received:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("✅ Checkout Session completed:", session.id);
      console.log("Customer Email:", session.customer_email);

      // ▼ ここでLINEメッセージ送信
      await lineClient.pushMessage(
        "<ユーザーの LINE ID>",
        {
          type: "text",
          text: "決済ありがとう！有料会員になりました！",
        }
      );
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error in Webhook route:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
