"use client";
import React, { useState } from "react";

export default function BookingForm() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [roomType, setRoomType] = useState("Deluxe");

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const bookingData = { checkIn, checkOut, guests, roomType };

    // Tạo URL với query params dựa trên dữ liệu form
    const params = new URLSearchParams({
      checkin: bookingData.checkIn,
      checkout: bookingData.checkOut,
      group_adults: bookingData.guests.toString(),
      room1: bookingData.roomType, // booking.com có thể cần format khác
      // Thêm các param khác nếu muốn demo
      aid: "2436571",
      label: "short-demo",
      dest_id: "20001173",
      dest_type: "city",
      no_rooms: "1",
      req_children: "0",
    });

    // Redirect sang booking.com demo
    window.location.href = `https://www.booking.com/hotel/vn/muong-thanh-luxury-da-nang.vi.html?${params.toString()}`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border p-4 flex flex-col md:flex-row md:items-end gap-3"
    >
      {/* Check-in */}
      <div className="flex-1">
        <label className="text-sm text-slate-600">Ngày đến</label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-full mt-1 border rounded-md px-2 py-1 text-sm"
          required
        />
      </div>

      {/* Check-out */}
      <div className="flex-1">
        <label className="text-sm text-slate-600">Ngày đi</label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-full mt-1 border rounded-md px-2 py-1 text-sm"
          required
        />
      </div>

      {/* Guests */}
      <div className="flex-1">
        <label className="text-sm text-slate-600">Số khách</label>
        <input
          type="number"
          min="1"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full mt-1 border rounded-md px-2 py-1 text-sm"
          required
        />
      </div>

      {/* Room type */}
      <div className="flex-1">
        <label className="text-sm text-slate-600">Loại phòng</label>
        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          className="w-full mt-1 border rounded-md px-2 py-1 text-sm"
        >
          <option value="Superior">Superior</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Suite">Suite</option>
        </select>
      </div>

      {/* Submit button */}
      <div>
        <button
          type="submit"
          className="w-full md:w-auto bg-sky-600 text-white py-2 px-6 rounded-md mt-2 md:mt-0"
        >
          Tìm phòng
        </button>
      </div>
    </form>
  );
}
