// /api/generate-personal-form.js

import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req) {
  try {
    const body = await req.json()
    const { lineId, name, birthdate, birthplace, birthtime } = body

    // ① GPTに投げるプロンプト生成
    const prompt = `以下の情報をもとに、性格や運勢などを含むユーザー説明書をJSON形式で作成してください。
      名前：${name}
      生年月日：${birthdate}
      出生地：${birthplace}
      出生時間：${birthtime || '不明'}
      出力形式は以下のJSON形式で、すべて日本語で記述してください。各項目には指定された文字数の範囲で簡潔に記述してください：
      {
        "personality": "基本性格（80〜120文字）",
        "values": "価値観（80〜120文字）",
        "mission": "人生の目的・使命（80〜120文字）",
        "love": "恋愛傾向（80〜120文字）",
        "talent": "才能・適性（80〜120文字）",
        "message": "今のあなたへのメッセージ（80〜120文字）",
        "challenge": "乗り越えるべき課題（80〜120文字）",
        "pattern": "成功のパターン（80〜120文字）"
      }
      出力はプレーンなJSONオブジェクトのみとし、コメントや説明文を含めないでください。`;

    // GPTレスポンス取得とJSONパースに修正
    const gptRes = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'あなたは熟練の占い師であり、指定されたJSON形式で結果を出力します。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })

    const gptText = gptRes.choices[0]?.message?.content?.trim()
    let gptJson = null

    try {
      gptJson = JSON.parse(gptText)
    } catch (e) {
      console.error('GPT JSON parse error:', e)
      return NextResponse.json({ message: 'GPTの出力形式が不正です' }, { status: 500 })
    }

    if (!gptJson || typeof gptJson !== 'object') {
      return NextResponse.json({ message: 'GPTのJSONデータが取得できませんでした' }, { status: 500 })
    }

    // Flaskに構造化JSONを送信
    const pythonRes = await fetch(process.env.PYTHON_SERVER_URL + '/generate_personal_image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...gptJson,
        name,
        birthdate,
        birthplace,
        birthtime,
        lineId
      })
    })

    const result = await pythonRes.json()

    if (!pythonRes.ok) {
      return NextResponse.json({ message: '画像生成に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ message: '生成完了', imageUrl: result.imageUrl })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'サーバーエラー' }, { status: 500 })
  }
}
