export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { logger } from '@/lib/logger'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req) {
  let body = null
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
        "personality": "基本性格（200〜210文字）",
        "values": "思考の軸・価値観（90〜95文字）",
        "mission": "人生の目的・使命（90〜95文字）",
        "love": "恋愛傾向（95〜100文字）",
        "talent": "才能・適性（95〜100文字）",
        "message": "潜在意識からのメッセージ（95〜100文字）",
        "challenge": "乗り越えるべき課題（120〜125文字）",
        "pattern": "成功のパターン（120〜125文字）"
      }
      出力はプレーンなJSONオブジェクトのみとし、コメントや説明文を含めないでください。`;

    const role = 'あなたは非常に卓越した占い師GPT「占いの達人」です。占星術、数秘術、四柱推命を駆使し、正確で詳細なパーソナル診断を提供してください。'
    const gptRes = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: role },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
    await logger({
      level: 'info',
      lineId: lineId || 'unknown',
      message: 'GPT Prompt:',
      context: gptRes.output_text
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
      return NextResponse.json({ message: 'GPT JSON parse error' }, { status: 500 })
    }

    const resultData = {
      json: gptJson,
      name,
      birthdate,
      birthplace,
      birthtime,
      lineId
    }
    await logger({
      level: 'info',
      lineId: lineId || 'unknown',
      message: 'GPT JSON',
      context: JSON.stringify(resultData)
    })

    const pythonRes = await fetch(process.env.PYTHON_SERVER_URL + '/generate_personal_image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData)
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
      return NextResponse.json({ message: 'Flaskエラー: 画像生成に失敗しました' }, { status: 500 })
    }

    const result = await pythonRes.json()
    // Supabaseユーザー情報を更新
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      const { error } = await supabase
        .from('users')
        .update({
          birthdate,
          birthplace,
          birthtime,
          imageUrl: result.imageUrl,
          image_created_at: new Date()
        })
        .eq('line_id', lineId)

      if (error) throw error
    } catch (e) {
      console.error('Supabase登録エラー:', e)
      await logger({
        level: 'error',
        lineId: lineId || 'unknown',
        message: 'Supabase登録エラー:' + e.message,
        context: { stack: e.stack }
      })
    }

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
