"use client";
import { formatDate } from "@/lib/formatDate";
import { useStoreBookings } from "../store";

export default function BookingsTable() {
  const bookings = useStoreBookings((s) => s.bookings);

  return (
    <div className="table-wrap overflow-x-auto">
      <table className="table min-w-full border">
        <thead>
          <tr>
            <th className="tbl-id">#</th>
            <th className="tbl-date">Ngày đặt</th>
            <th className="tbl-name">Họ và tên</th>
            <th className="tbl-phone">Số điện thoại</th>
            <th className="tbl-email">Email</th>
            <th className="tbl-in">Check-in</th>
            <th className="tbl-out">Check-out</th>
            <th className="tbl-room">Loại phòng</th>
            <th className="tbl-note">Ghi chú</th>
            <th className="tbl-status">Tình trạng</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((row, idx: number) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{formatDate(row["Ngày đặt"])}</td>
              <td>{row["Họ và tên"] ?? "-"}</td>
              <td>{row["Số điện thoại"] ?? "-"}</td>
              <td>{row["Email"] ?? "-"}</td>
              <td>{formatDate(row["Check-in"])}</td>
              <td>{formatDate(row["Check-out"])}</td>
              <td>{row["Loại phòng"] ?? "-"}</td>
              <td>{row["Ghi chú khách"] ?? "-"}</td>
              <td>{row["Tình trạng"] ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
