import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();

    const { lineId, displayName } = body;

    if (!lineId) {
      return NextResponse.json(
        { error: "Missing lineId" },
        { status: 400 }
      );
    }

    // 既存ユーザを確認
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("line_id", lineId)
      .maybeSingle();

    if (findError) {
      console.error("Supabase SELECT error", findError);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    if (existingUser) {
      // 既存ユーザなら displayName を更新
      await supabase
        .from("users")
        .update({
          display_name: displayName,
          updated_at: new Date(),
        })
        .eq("id", existingUser.id);

      console.log("User already exists and updated:", existingUser.id);
      return NextResponse.json({ ok: true, message: "Already registered" },{ status: 200 });
    }

    // 新規登録
    const { error: insertError } = await supabase
      .from("users")
      .insert({
        line_id: lineId,
        display_name: displayName,
        email: null,
        fortune_type: null,
        fortune_number: null,
        pdf_url: null,
        pdf_created_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

    if (insertError) {
      console.error("Supabase INSERT error", insertError);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    console.log("New user inserted:", lineId);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}