"use client";
import HotelDashboard from "./src_app/HotelDashboard";
import FetchRooms from "./src_app/service/fetch";

export default function ChatPage() {
  return (
    <div>
      <FetchRooms />
      <HotelDashboard />
    </div>
  );
}
