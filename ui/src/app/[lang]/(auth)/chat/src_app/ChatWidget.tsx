// ChatWidget.tsx (React)
import React, { useState } from "react";

export default function ChatWidget() {
  const [sessionId] = useState(
    () => "sess-" + Math.random().toString(36).slice(2, 8)
  );
  const [messages, setMessages] = useState<{ from: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState<{
    code: string;
    summary: string;
  } | null>(null);

  async function sendMessage(text: string) {
    setMessages((m) => [...m, { from: "user", text }]);
    const res = await fetch("/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message: text, chatHistory: [] }),
    });
    const j = await res.json();
    if (j.aiReply) setMessages((m) => [...m, { from: "ai", text: j.aiReply }]);
    if (j.confirmRequired) {
      setPendingConfirm({ code: j.confirmCode, summary: j.bookingSummary });
    }
  }

  async function confirmBooking() {
    if (!pendingConfirm) return;
    const res = await fetch("/chat/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, code: pendingConfirm.code }),
    });
    const j = await res.json();
    if (j.success) {
      setMessages((m) => [...m, { from: "ai", text: `🎉 ${j.message}` }]);
      setPendingConfirm(null);
    } else {
      setMessages((m) => [...m, { from: "ai", text: `⚠️ ${j.message}` }]);
    }
  }

  return (
    <div>
      <div
        style={{
          height: 300,
          overflow: "auto",
          border: "1px solid #ddd",
          padding: 8,
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.from}:</b> {m.text}
          </div>
        ))}
      </div>

      {pendingConfirm && (
        <div style={{ border: "1px solid #ccc", padding: 8, marginTop: 8 }}>
          <div>
            <b>Thông tin đặt phòng (vui lòng kiểm tra):</b>
          </div>
          <div>{pendingConfirm.summary}</div>
          <button onClick={confirmBooking}>Đồng ý đặt</button>
          <button onClick={() => setPendingConfirm(null)}>
            Không, chỉnh sửa
          </button>
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button
          onClick={() => {
            sendMessage(input);
            setInput("");
          }}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
