"use client";

import { useEffect } from "react";

export default function LineLoginFallbackPage() {
  useEffect(() => {
    console.log("LIFF連携失敗。フォールバックページ表示。");
  }, []);

  return (
    <main style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>LINE連携中...</h1>
      <p>自動で画面が切り替わらない場合は、下のボタンからLINEログインをお願いします。</p>
      <a
        href={process.env.NEXT_PUBLIC_LIFF_URL_PAY}
        style={{
          display: "inline-block",
          padding: "12px 24px",
          marginTop: "20px",
          background: "#06C755",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        LINEログイン
      </a>
    </main>
  );
}