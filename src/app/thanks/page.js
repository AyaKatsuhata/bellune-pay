"use client";

export default function ThanksPage() {
  return (
    <main style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>LINE連携が完了しました！</h1>
      <p>
        以下のボタンからLINEアカウントを
        友だち追加してください。
      </p>
      <a href="https://lin.ee/AEdeUms"><img src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png" alt="友だち追加" height="36" border="0"/></a>
    </main>
  );
}