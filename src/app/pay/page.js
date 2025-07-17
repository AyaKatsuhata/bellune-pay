"use client";

import { useEffect } from "react";

export default function PayPage() {
  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
        });

        const data = await res.json();

        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error("Checkout URL not found");
        }
      } catch (err) {
        console.error("Stripe Checkout エラー:", err);
        alert("決済ページの読み込みに失敗しました。しばらくしてから再度お試しください。");
      }
    };

    createSession();
  }, []);

  return (
    <main style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>決済ページへ遷移中です...</h1>
      <p>このままお待ちください。</p>
    </main>
  );
}