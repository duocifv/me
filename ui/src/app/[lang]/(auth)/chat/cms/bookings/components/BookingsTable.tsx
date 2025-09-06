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
            <th>Ngày đặt</th>
            <th>Họ và tên</th>
            <th>Số điện thoại</th>
            <th>Email</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Loại phòng</th>
            <th>Số đêm</th>
            <th>Số khách</th>
            <th>Ghi chú</th>
            <th>Ý định đặt phòng</th>
            <th>Lý do nhận diện</th>
            <th>Điểm đánh giá</th>
            <th>Hành động khuyến nghị</th>
            <th>Tình trạng</th>
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
              <td>{row["Số đêm"] ?? "-"}</td>
              <td>{row["Số khách"] ?? "-"}</td>
              <td>{row["Ghi chú khách"] ?? "-"}</td>
              <td>{row["Ý định đặt phòng"] ?? "-"}</td>
              <td>{row["Lý do nhận diện"] ?? "-"}</td>
              <td>{row["Điểm đánh giá"] ?? "-"}</td>
              <td>{row["Hành động khuyến nghị"] ?? "-"}</td>
              <td>{row["Tình trạng"] ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
