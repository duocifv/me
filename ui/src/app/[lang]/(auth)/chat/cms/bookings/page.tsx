"use client";

import BookingsTable from "./components/BookingsTable";
import FetchBookings from "./fetch";

export default function Bookings() {
  return (
    <div>
      <BookingsTable />
      <FetchBookings />
    </div>
  );
}
