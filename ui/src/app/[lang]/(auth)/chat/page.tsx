"use client";
import ChatWidget from "./src_app/ChatWidget";
import HotelDashboard from "./src_app/HotelDashboard";
import FetchRooms from "./src_app/service/fetch";

export default function ChatPage() {
  return (
    <div>
      <ChatWidget />
      <FetchRooms />
      <HotelDashboard />
    </div>
  );
}
