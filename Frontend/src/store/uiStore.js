import { create } from 'zustand'

const useUIStore = create((set) => ({
  searchOpen: false,
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
  closeSearch: () => set({ searchOpen: false }),
}))

export default useUIStore