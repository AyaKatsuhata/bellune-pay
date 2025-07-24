import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import * as line from "@line/bot-sdk";

export const runtime = "nodejs";

// Stripe 初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Supabase 初期化 (Service Role Key 使用)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      // 必要なら他イベントをここに追加
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("Error in Webhook route:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session) {
  console.log("Processing checkout.session.completed:", session.id);
  console.log("✅ Session:", session);

  const email = session.customer_email || session.customer_details?.email;
  const stripeCustomerId = session.customer;
  const stripeSubscriptionId = session.subscription;

  if (!email) {
    console.error("❌ Stripe session に email が含まれていません");
    return;
  }

  // Supabaseで該当ユーザを検索
  let { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase SELECT error:", error);
    return;
  }

  let userId;

  if (!user) {
    // 新規ユーザ作成
    const { data: insertedUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email: email,
        stripe_customer_id: stripeCustomerId,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase INSERT error:", insertError);
      return;
    }
    console.log("✅ New user inserted:", insertedUser.id);
    userId = insertedUser.id;

  } else {
    // 既存ユーザを更新
    const { error: updateError } = await supabase
      .from("users")
      .update({
        stripe_customer_id: stripeCustomerId,
        updated_at: new Date(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Supabase UPDATE error:", updateError);
      return;
    }
    console.log("✅ Existing user updated:", user.id);
    userId = user.id;
  }

  // subscription_history に登録
  if (stripeSubscriptionId) {
    const { error: subError } = await supabase
      .from("subscription_history")
      .insert({
        user_id: userId,
        stripe_subscription_id: stripeSubscriptionId,
        status: "active",
        started_at: new Date(),
      });

    if (subError) {
      console.error("Supabase INSERT subscription_history error:", subError);
      return;
    }
    console.log("✅ Subscription history inserted");
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log("Processing customer.subscription.deleted:", subscription.id);

  const stripeCustomerId = subscription.customer;
  const stripeSubscriptionId = subscription.id;

  // ユーザ取得
  const { data: user, error } = await supabase
    .from("users")
    .select("id")
    .eq("stripe_customer_id", stripeCustomerId)
    .single();

  if (error || !user) {
    console.error("Supabase user lookup error:", error);
    return;
  }

  const { error: updateError } = await supabase
    .from("subscription_history")
    .update({
      status: "canceled",
      canceled_at: new Date(),
      updated_at: new Date(),
    })
    .eq("user_id", user.id)
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (updateError) {
    console.error("Supabase subscription_history update error:", updateError);
    return;
  }

  console.log("✅ Subscription canceled updated for user:", user.id);
}