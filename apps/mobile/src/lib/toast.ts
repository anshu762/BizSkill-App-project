/**
 * Toast utility — drop-in replacement for react-native-toast-message.
 *
 * Uses Zustand store which drives a Modal-based component in _layout.tsx.
 * This approach works reliably on Expo Go / Android because Modal renders
 * in a true native overlay, completely outside the react-native-screens
 * navigation tree (which can freeze/pause Animated timers on inactive screens).
 */
import { useToastStore, ToastType } from '../stores/useToastStore';

let hideTimer: ReturnType<typeof setTimeout> | null = null;

const VISIBILITY_MS = 4000;

function show(opts: { type: ToastType; text1: string; text2?: string }) {
  // Clear any existing timer first
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  useToastStore.getState()._show(opts);

  // Own reliable timer — does not depend on library internals or Animated
  hideTimer = setTimeout(() => {
    useToastStore.getState()._hide();
    hideTimer = null;
  }, VISIBILITY_MS);
}

function hide() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  useToastStore.getState()._hide();
}

// Match react-native-toast-message API so no call-sites need to change
export const Toast = { show, hide };

// Default export for compatibility with:  import Toast from "..."
export default Toast;
