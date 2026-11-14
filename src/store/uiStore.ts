import { create } from 'zustand'

interface UIState {
  // Tracks which Today activity cards have been tapped (mock completion)
  completedActivityIds: string[]
  toggleActivityComplete: (id: string) => void

  // Explore bookmarks (mock)
  bookmarkedCardIds: string[]
  toggleBookmark: (id: string) => void

  // Revise modal
  reviseModalOpen: boolean
  reviseTopicId: string | null
  openReviseModal: (topicId: string) => void
  closeReviseModal: () => void
}

export const useUIStore = create<UIState>()((set, get) => ({
  completedActivityIds: [],
  toggleActivityComplete: (id) => {
    const current = get().completedActivityIds
    const isCompleted = current.includes(id)
    set({
      completedActivityIds: isCompleted
        ? current.filter((x) => x !== id)
        : [...current, id],
    })
  },

  bookmarkedCardIds: [],
  toggleBookmark: (id) => {
    const current = get().bookmarkedCardIds
    const isBookmarked = current.includes(id)
    set({
      bookmarkedCardIds: isBookmarked
        ? current.filter((x) => x !== id)
        : [...current, id],
    })
  },

  reviseModalOpen: false,
  reviseTopicId: null,
  openReviseModal: (topicId) => set({ reviseModalOpen: true, reviseTopicId: topicId }),
  closeReviseModal: () => set({ reviseModalOpen: false, reviseTopicId: null }),
}))
