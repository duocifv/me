import { create } from "zustand";
import { RoomType } from "./type";

type State = {
  rooms: RoomType[];
  setRooms: (rows: RoomType[]) => void;
};

export const useStoreRooms = create<State>((set) => ({
  rooms: [],
  setRooms: (rows) => set({ rooms: Array.isArray(rows) ? rows : [] }),
}));
