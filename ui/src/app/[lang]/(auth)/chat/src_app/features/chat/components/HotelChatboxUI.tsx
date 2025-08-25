"use client";
// HotelChatboxAI.jsx
import React, { useState, useEffect, useRef } from "react";
import { Send, Maximize2, X } from "lucide-react";

const STORAGE_KEY = "hotel_chat_history";

export default function HotelChatboxAI() {
  const [messages, setMessages] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : [
            {
              role: "assistant",
              content: "Xin chào 👋, tôi có thể giúp gì cho bạn hôm nay?",
            },
          ];
    }
    return [
      {
        role: "assistant",
        content: "Xin chào 👋, tôi có thể giúp gì cho bạn hôm nay?",
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(
        "https://vegetable-container.onrender.com/v1/ai/hotel-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: input,
            chatHistory: updatedMessages, // Gửi toàn bộ chat history
          }),
        }
      );
      const data = await res.json();
      const aiMsg = {
        role: "assistant",
        content: data.reply || "Xin lỗi, tôi chưa hiểu câu hỏi.",
      };
      setMessages((prev: { role: string; content: string }[]) => [
        ...prev,
        aiMsg,
      ]);
    } catch (err) {
      console.error(err);
      const aiMsg = {
        role: "assistant",
        content: "Có lỗi xảy ra khi kết nối AI.",
      };
      setMessages((prev: { role: string; content: string }[]) => [
        ...prev,
        aiMsg,
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  type Message = {
    role: string;
    content: string;
  };

  const renderMessage = (msg: Message, idx: number) => (
    <div
      key={idx}
      className={`flex ${
        msg.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm ${
          msg.role === "user"
            ? "bg-sky-600 text-white rounded-br-none"
            : "bg-slate-100 text-slate-800 rounded-bl-none"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );

  return (
    <>
      {!isFullscreen && (
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden h-[327px]">
          {/* Header */}
          <div className="p-4 bg-sky-600 text-white font-semibold text-lg flex justify-between items-center">
            Chăm sóc khách hàng
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1 hover:bg-sky-700 rounded"
            >
              <Maximize2 size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 h-80 bg-slate-50">
            {messages.map(renderMessage)}
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-500 text-sm">
                  AI đang gõ<span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex items-center gap-2">
            <input
              type="text"
              placeholder="Hãy hỏi tôi bất kỳ điều gì..."
              className="flex-1 px-4 py-2 rounded-full border text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="p-2 bg-sky-600 text-white rounded-full hover:bg-sky-700"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {isFullscreen && (
        <div className="fixed inset-0 m-0 bg-slate-100 flex flex-col z-50 !m-0">
          {/* Header */}
          <div className="p-4 border-b bg-white flex justify-between items-center">
            <span className="font-semibold text-slate-700">
              Chăm sóc khách hàng
            </span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-slate-200 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 w-full max-w-[860px] mx-auto">
            {messages.map(renderMessage)}
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-500 text-sm">
                  AI đang gõ<span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="w-[80%] p-4 border-t bg-white flex items-center gap-2 md:w-full max-w-[768px] mx-auto rounded-xl mb-8">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-3 rounded-xl border text-base focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="p-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
