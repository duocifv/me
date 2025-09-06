// ChatWidget.jsx
import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import HotelChatboxUI from "./HotelChatboxUI";

export default function ChatWidget() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 transition"
            >
                <MessageCircle size={24} />
            </button>

            {/* Modal fullscreen */}
            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="relative w-full h-full flex justify-center items-center">
                        {/* Close button */}
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:bg-slate-100"
                        >
                            <X size={22} />
                        </button>

                        {/* Chatbox full screen */}
                        <div className="w-full h-full max-w-3xl bg-white rounded-xl shadow-xl flex flex-col">
                            <HotelChatboxUI />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
