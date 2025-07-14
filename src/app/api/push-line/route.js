import { Client } from "@line/bot-sdk";

export const runtime = "edge";

export async function POST(req) {
  const body = await req.json();

  const client = new Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
  });

  await client.pushMessage(body.userId, {
    type: "text",
    text: body.message
  });

  return new Response(JSON.stringify({ status: "ok" }));
}
