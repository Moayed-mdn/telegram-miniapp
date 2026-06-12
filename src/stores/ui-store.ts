"use client";

import { create } from "zustand";

interface UiState {
  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMenuOpen: false,
  setMenuOpen: (open) => set({ isMenuOpen: open }),
}));
