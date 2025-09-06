/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import HotelChatboxUI from "./features/chat/components/HotelChatboxUI";
import BookingForm from "./features/booking/BookingForm";
import { useStoreRooms } from "./service/store";
import { RoomType } from "./service/type";

export default function HotelDashboard({ hotel = null }) {
  const rooms = useStoreRooms((s) => s.rooms);
  const sampleHotel = hotel || {
    name: "Mường Thanh Luxury Đà Nẵng Hotel",
    address: "270 Võ Nguyên Giáp, Mỹ An, Ngũ Hành Sơn, Đà Nẵng",
    phone: "+84 236 3956 789",
    email: "info@muongthanhdanang.vn",
    checkIn: "14:00",
    checkOut: "12:00",
    description:
      "Khách sạn 4 sao ven biển, phục vụ nhà hàng, spa, hồ bơi, phòng hội nghị và dịch vụ đưa đón sân bay.",
    images: [
      "https://booking.muongthanh.com/images/service/2022/07/original/hotelservice19_1659000240.jpg",
      "https://booking.muongthanh.com/images/service/2022/07/original/ms_1658199195_1658999474.jpg",
      "https://booking.muongthanh.com/images/service/2022/07/original/be-boi_1658999681.jpg",
      "https://booking.muongthanh.com/images/service/2022/07/original/kara_1658199155_1658999543.jpg",
    ],
    services: [
      {
        id: "s1",
        title: "Nhà hàng 24/7",
        subtitle: "Ẩm thực Á – Âu, buffet sáng đa dạng",
        icon: "🍽️",
      },
      {
        id: "s2",
        title: "Spa & Massage",
        subtitle: "Liệu trình thư giãn 60/90 phút",
        icon: "💆",
      },
      {
        id: "s3",
        title: "Hồ bơi ngoài trời",
        subtitle: "Pool view cực chill, kèm pool bar",
        icon: "🏊",
      },
      {
        id: "s4",
        title: "Tour tham quan",
        subtitle: "Khám phá Vịnh Hạ Long – tour 1 ngày",
        icon: "🛥️",
      },
      {
        id: "s5",
        title: "Đưa đón sân bay",
        subtitle: "Dịch vụ xe riêng 4 – 7 chỗ",
        icon: "🚐",
      },
      {
        id: "s6",
        title: "Phòng Gym",
        subtitle: "Trang thiết bị hiện đại, mở cửa tự do",
        icon: "💪",
      },
    ],
    rooms: [
      {
        id: "r1",
        type: "Superior",
        beds: "1 King",
        price: 120,
        images:
          "https://booking.muongthanh.com/images/rooms/hls/original/sm_large_grand_suite__4__1553048377.jpg",
      },
      {
        id: "r2",
        type: "Deluxe",
        beds: "2 Single",
        price: 150,
        images:
          "https://booking.muongthanh.com/images/rooms/hls/original/sm_large_deluxe_king_1553047078.jpg",
      },
      {
        id: "r3",
        type: "Suite",
        beds: "1 King + Living",
        price: 260,
        images:
          "https://booking.muongthanh.com/images/rooms/hls/original/sm_large_mt_luxyry___anang__2_of_178__-_resize_1559794115.jpg",
      },
    ],
    policies: [
      "Hủy miễn phí 48 giờ trước khi nhận phòng.",
      "Không hút thuốc trong phòng.",
      "Thú cưng không được phép.",
    ],
  };

  const data = sampleHotel;

  // Small UI subcomponents
  const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-800">
      {children}
    </span>
  );

  type Service = {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
  };

  const ServiceCard: React.FC<{ item: Service }> = ({ item }) => (
    <div className="p-4 bg-white rounded-2xl shadow-sm border">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{item.icon}</div>
        <div>
          <h4 className="font-semibold">{item.title}</h4>
          <p className="text-sm text-slate-500">{item.subtitle}</p>
        </div>
      </div>
    </div>
  );

  const RoomCard: React.FC<{ room: RoomType }> = ({ room }) => (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="h-36 bg-slate-100 flex items-center justify-center">
        <img src={room["Hình ảnh"]} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h5 className="font-semibold">{room["Loại phòng"]}</h5>
        </div>
        <div className="text-sm">
          {Number(room.Giá).toLocaleString("vi-VN")} VND
        </div>
        <div className="text-sm">{room["Mô tả"]}</div>
        <p className="text-sm text-slate-500">Sức chứa: {room["Sức chứa"]}</p>
        <div className="mt-3 flex gap-2">
          <button className="px-3 py-1 rounded-md border text-sm">
            Xem chi tiết
          </button>
          <button className="px-3 py-1 rounded-md bg-sky-600 text-white text-sm">
            Đặt ngay
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <p className="text-sm text-slate-500">{data.address}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge>Check-in {data.checkIn}</Badge>
          <Badge>Check-out {data.checkOut}</Badge>
          <button className="px-4 py-2 rounded-md bg-emerald-600 text-white">
            Gọi đặt: {data.phone}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Overview & services */}
        <section className="lg:col-span-2 space-y-6">
          {/* Hero / Description */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Giới thiệu</h2>
                <p className="text-slate-600 mt-2">{data.description}</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {data.images.map((src, i) => (
                    <div
                      key={i}
                      className="w-32 h-20 bg-slate-100 rounded overflow-hidden flex items-center justify-center text-slate-400"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-56">
                <h3 className="font-medium text-slate-700">Thông tin nhanh</h3>
                <ul className="mt-2 text-sm text-slate-600 space-y-1">
                  <li>Điện thoại: {data.phone}</li>
                  <li>Email: {data.email}</li>
                  <li>Chính sách: {data.policies[0]}</li>
                </ul>
                <div className="mt-4">
                  <button className="w-full px-3 py-2 rounded-md bg-sky-600 text-white">
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 block md:hidden">
            <HotelChatboxUI />
          </div>

          {/* Services grid */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <h3 className="font-semibold mb-4">Dịch vụ & Tiện ích</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.services.map((s) => (
                <ServiceCard key={s.id} item={s} />
              ))}
            </div>
          </div>

          {/* Rooms */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Phòng</h3>
              <div className="text-sm text-slate-500">
                {data.rooms.length} loại phòng
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((r, idx) => (
                <RoomCard key={idx} room={r} />
              ))}
            </div>
          </div>
        </section>

        {/* Right column: Contact, Map, Reviews */}
        <aside className="space-y-6">
          <div className="hidden md:block">
            <HotelChatboxUI />
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <h4 className="font-semibold">Liên hệ nhanh</h4>
            <p className="text-sm text-slate-600 mt-2">{data.address}</p>
            <p className="text-sm mt-2">{data.phone}</p>
            <div className="mt-3">
              <button className="w-full px-3 py-2 rounded-md bg-amber-500 text-white">
                Gửi yêu cầu
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <h4 className="font-semibold">Đánh giá nhanh</h4>
            <div className="mt-2 text-sm text-slate-600">
              ⭐️⭐️⭐️⭐️ 4.3 (1,024 đánh giá)
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <h4 className="font-semibold">Bản đồ</h4>
            <div className="mt-3 h-40 bg-slate-100 rounded flex items-center justify-center text-slate-400">
              <iframe
                title="Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15336.907114696829!2d108.2473636!3d16.0537175!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142177a5081b45b%3A0x1dba027958889476!2zTcaw4budbmcgVGhhbmggTHV4dXJ5IMSQw6AgTuG6tW5nIEhvdGVs!5e0!3m2!1svi!2s!4v1688110257111!5m2!1svi!2s"
                width="100%"
                height="160"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer: Policies & Actions */}
      {/* Footer: Booking + Policies + Actions */}
      {/* Footer: Booking + Policies */}
      <div className="mt-8 ">
        <BookingForm />
      </div>

      {/* Floating Chatbox AI */}
      {/* <div className="fixed bottom-6 right-6 z-50">
                {isOpen ? (
                    <div className="w-80 h-96 bg-white border rounded-2xl shadow-lg flex flex-col">
                        <div className="p-3 border-b flex justify-between items-center bg-sky-600 text-white rounded-t-2xl">
                            <span>Hỗ trợ AI</span>
                            <button onClick={() => setIsOpen(false)}>✖</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
                            {messages.map((m, i) => (
                                <div key={i} className={`p-2 rounded-lg max-w-[80%] ${m.role === 'bot' ? 'bg-slate-100 text-slate-800 self-start' : 'bg-sky-600 text-white self-end ml-auto'}`}>
                                    {m.text}
                                </div>
                            ))}
                        </div>
                        <div className="p-2 border-t flex gap-2">
                            <input
                                type="text"
                                className="flex-1 border rounded px-2 text-sm"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Nhập câu hỏi..."
                            />
                            <button
                                className="px-3 rounded bg-sky-600 text-white text-sm"
                                onClick={sendMessage}
                            >
                                Gửi
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="px-4 py-3 rounded-full bg-sky-600 text-white shadow-lg"
                    >
                        💬 Hỗ trợ
                    </button>
                )}
            </div> */}
    </div>
  );
}
