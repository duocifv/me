import { create } from "zustand";
import { BookingRecord } from "./type";


type PostState = {
  posts: BookingRecord[];
  setPosts: (rows: BookingRecord[]) => void;
};

export const useStorePost = create<PostState>((set) => ({
  posts: [],
  setPosts: (rows) => set({ posts: Array.isArray(rows) ? rows : [] }),
}));
