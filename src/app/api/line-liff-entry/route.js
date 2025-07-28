import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { lineId, displayName, email } = body;

    if (!lineId || !displayName) {
      return NextResponse.json(
        { error: "Missing lineId or displayName" },
        { status: 400 }
      );
    }

    // 既存ユーザーの確認（lineIdで検索）
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("line_id", lineId)
      .maybeSingle();

    if (findError) {
      console.error("❌ Supabase SELECT error", findError);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    if (existingUser) {
      // 既存ユーザー → displayNameのみ更新（emailは更新しない）
      const { error: updateError } = await supabase
        .from("users")
        .update({
          display_name: displayName,
          updated_at: new Date(),
        })
        .eq("id", existingUser.id);

      if (updateError) {
        console.error("❌ Supabase UPDATE error", updateError);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }

      console.log("✅ Updated user:", existingUser.id);
      return NextResponse.json({ ok: true, updated: true }, { status: 200 });
    }

    // 新規ユーザー → email を含めて保存
    const { error: insertError } = await supabase.from("users").insert({
      line_id: lineId,
      display_name: displayName,
      email: email || null,
      fortune_type: null,
      fortune_number: null,
      pdf_url: null,
      pdf_created_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (insertError) {
      console.error("❌ Supabase INSERT error", insertError);
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    console.log("✅ Inserted new user:", lineId);
    return NextResponse.json({ ok: true, created: true }, { status: 201 });
  } catch (err) {
    console.error("❌ Unexpected error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}