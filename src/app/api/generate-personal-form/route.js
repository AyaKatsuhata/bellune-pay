import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { logger } from '@/lib/logger'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req) {
  let body = null
  let lineId = null
  try {
    body = await req.json()
    const { lineId, name, birthdate, birthplace, birthtime } = body

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

    const gptRes = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'あなたは熟練の占い師であり、指定されたJSON形式で結果を出力します。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })

    let gptJson = null
    try {
      const gptText = gptRes.choices[0]?.message?.content?.trim()
      gptJson = JSON.parse(gptText)
      if (!gptJson || typeof gptJson !== 'object') {
        throw new Error('GPTの出力が空またはオブジェクトでありません。')
      }
    } catch (err) {
      console.error('GPT JSON parse error:', err)
      await logger({
        level: 'error',
        lineId: lineId || 'unknown',
        message: 'GPT JSON parse error:' + err.message,
        context: { stack: err.stack }
      })
    }

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
    if (!pythonRes.ok) {
      const text = await pythonRes.text();
      console.error('Flaskエラー内容:', text)
      await logger({
        level: 'error',
        lineId: lineId || 'unknown',
        message: 'Flaskエラー: 画像生成に失敗しました',
        context: text
      })
    }
    const result = await pythonRes.json()
    return NextResponse.json({ message: '生成完了', imageUrl: result.imageUrl })

  }catch (err) {
    console.error(err)
    await logger({
      level: 'error',
      lineId: lineId || 'unknown',
      message: err.message,
      context: { stack: err.stack }
    })
    return NextResponse.json({ message: 'サーバーエラー' }, { status: 500 })
}
}
