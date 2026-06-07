/**
 * Global Toast Store (Zustand)
 * Drives the custom Modal-based toast that renders outside the navigation tree.
 */
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  visible: boolean;
  type: ToastType;
  text1: string;
  text2?: string;
  _show: (opts: { type: ToastType; text1: string; text2?: string }) => void;
  _hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  type: 'success',
  text1: '',
  text2: undefined,
  _show: (opts) => set({ visible: true, ...opts }),
  _hide: () => set({ visible: false }),
}));
