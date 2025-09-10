export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { logger } from '@/lib/logger'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req) {
  let body = null
  try {
    body = await req.json()
    const { lineId, name, birthdate, birthplace, birthtime } = body

    const inputText = `
      名前: ${name}
      生年月日: ${birthdate}
      出生地: ${birthplace}
      出生時間: ${birthtime || '不明'}`
    const gptRes = await client.responses.create({
      prompt: {
        id: "pmpt_68c0f9d6c28c81909fb8768a4c8a12690a9a7ee3b5596b95",
        version: "3"
      },
      input: inputText
    })
    await logger({
      level: 'info',
      lineId: lineId || 'unknown',
      message: 'GPT Prompt',
      context: gptRes.output_text
    })

    let gptJson = null
    try {
      const gptText = gptRes.output_text?.trim()
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
