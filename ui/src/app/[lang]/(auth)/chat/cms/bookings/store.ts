import { create } from "zustand";
import { BookingType } from "./type";

type State = {
  bookings: BookingType[];
  setBookings: (rows: BookingType[]) => void;
};

export const useStoreBookings = create<State>((set) => ({
  bookings: [],
  setBookings: (rows) => set({ bookings: Array.isArray(rows) ? rows : [] }),
}));
