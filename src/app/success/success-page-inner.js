"use client";

import { useEffect } from "react";

export default function SuccessPageInner() {
  const liffUrl = process.env.NEXT_PUBLIC_LIFF_URL;

  useEffect(() => {
    if (liffUrl) {
      window.location.href = liffUrl;
    }
  }, [liffUrl]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>決済が完了しました！</h1>
      <p>自動でLINE連携に進みます。<br />数秒お待ちください。</p>

      <a
        href={liffUrl}
        style={{
          display: "inline-block",
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#06c755",
          color: "white",
          borderRadius: "4px",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        LINE連携はこちら
      </a>
    </div>
  );
}