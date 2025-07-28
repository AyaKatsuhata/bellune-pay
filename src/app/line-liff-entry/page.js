"use client";

import { useEffect, useState } from "react";

export default function LineLiffEntryPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    console.log("🔍 LIFF ID:", liffId);

    const loadLiff = async () => {
      try {
        const liff = (await import("@line/liff")).default;
        await liff.init({ liffId });
        console.log("⏳ LIFF import OK");

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        let profile;
        try {
          profile = await liff.getProfile();
          console.log("✅ Got profile:", profile);
          if (!profile?.userId) {
            throw new Error("LINE profile not found");
          }
        } catch (err) {
          console.error("Profile fetch error", err);
          window.location.href = "/line-login-fallback";
          return;
        }

        const res = await fetch("/api/line-liff-entry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lineId: profile.userId,
            displayName: profile.displayName,
          }),
        });

        if (res.ok) {
          window.location.href = "/thanks";
        } else {
          console.error("API error", await res.text());
          window.location.href = "/line-login-fallback";
        }
      } catch (err) {
        console.error("LIFF error:", err);
        window.location.href = "/line-login-fallback";
      } finally {
        setLoading(false);
      }
    };

    loadLiff();
  }, []);

  return (
    <main style={{ textAlign: "center", marginTop: "100px" }}>
      {loading ? (
        <>
          <p>LINE連携中...お待ちください。</p>
          <div
            style={{
              margin: "20px auto",
              width: "50px",
              height: "50px",
              border: "5px solid #ccc",
              borderTop: "5px solid #06c755",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </>
      ) : (
        <p>処理が完了しました。</p>
      )}
    </main>
  );
}