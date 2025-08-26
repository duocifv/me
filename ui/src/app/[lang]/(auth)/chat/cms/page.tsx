"use client";

import "../src_app/cms.css";
import Bookings from "./bookings/page";

export default function ChatPage() {
  return (
    <div>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex justify-between items-center px-4 lg:px-6">
          <div>
            <h2 className="text-2xl font-semibold">Khách đặt phòng</h2>
          </div>
        </div>
        <Bookings />
      </div>
    </div>
  );
}
