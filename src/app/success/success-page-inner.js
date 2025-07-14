"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessPageInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div style={{ padding: "2rem" }}>
      <h1>決済が完了しました！</h1>
      <p>Session ID: {sessionId}</p>

      <a
        href="https://line.me/R/ti/p/U0bbb2ad3b6ea1da17a2c5c21bc2a03a3"
        style={{
          display: "inline-block",
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#06c755",
          color: "white",
          borderRadius: "4px",
          textDecoration: "none",
        }}
      >
        LINEで占い結果を受け取る
      </a>
    </div>
  );
}
