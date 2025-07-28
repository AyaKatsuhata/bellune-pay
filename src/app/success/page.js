// src/app/success/page.js
"use client";

import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [status, setStatus] = useState("loading");
  const liffUrl = process.env.NEXT_PUBLIC_LIFF_URL;

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");

        if (!sessionId) {
          throw new Error("session_id not found");
        }

        const res = await fetch(`/api/get-session?session_id=${sessionId}`);
        const data = await res.json();

        if (!res.ok || !data.email) {
          throw new Error("email not found in session");
        }

        // セッションにemailを保存
        sessionStorage.setItem("email", data.email);

        // LIFFページへ遷移
        if (liffUrl) {
          window.location.href = liffUrl;
        } else {
          throw new Error("LIFF URL not defined");
        }
      } catch (err) {
        console.error("Success処理エラー:", err);
        setStatus("error");
      }
    };

    fetchAndRedirect();
  }, [liffUrl]);

  if (status === "error") {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>エラーが発生しました</h1>
        <p>再読み込みするか、サポートにお問い合わせください。</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>決済が完了しました！</h1>
      <p>自動でLINE連携に進みます。<br />数秒お待ちください。</p>
    </div>
  );
}