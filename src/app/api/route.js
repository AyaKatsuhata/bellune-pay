import OpenAI from "openai";

export const runtime = "edge";

export async function POST(req) {
  const { type, detail } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.GPT_API_KEY
  });

  const prompt = detail
    ? `「${type}」タイプの今週の運勢を詳しく300文字で教えて。`
    : `「${type}」タイプの今日の運勢を150文字以内で教えて。`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 300
  });

  return new Response(
    JSON.stringify({ text: completion.choices[0].message.content }),
    { status: 200 }
  );
}
