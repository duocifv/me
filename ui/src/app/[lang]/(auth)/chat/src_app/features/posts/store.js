import { create } from 'zustand'

export const useStorePost = create((set) => ({
  posts: [],
  setPosts: (rows) => set({ posts: Array.isArray(rows) ? rows : [] }),
}))
