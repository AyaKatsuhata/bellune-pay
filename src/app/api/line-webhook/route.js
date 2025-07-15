export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import * as line from "@line/bot-sdk";
import OpenAI from "openai";

const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

export async function POST(req) {
  console.log("LINE webhook received!");
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature");

  const isValid = line.validateSignature(
    rawBody,
    process.env.LINE_CHANNEL_SECRET,
    signature
  );

  if (!isValid) {
    console.error("Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const events = JSON.parse(rawBody).events;

    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const userMessage = event.message.text;
        const userId = event.source.userId;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "あなたは占い師です。" },
            { role: "user", content: userMessage },
          ],
        });

        const aiReply = completion.choices[0].message.content;

        await client.pushMessage(userId, {
          type: "text",
          text: aiReply,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
