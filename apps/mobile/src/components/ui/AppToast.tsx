/**
 * AppToast — Fully custom, self-managing toast notification system.
 * Completely replaces react-native-toast-message to avoid Android timer issues.
 *
 * Usage (anywhere in the app):
 *   import { showToast } from '@/components/ui/AppToast';
 *   showToast({ type: 'success', text1: 'Done!' });
 *   showToast({ type: 'error', text1: 'Failed', text2: 'Try again' });
 *   showToast({ type: 'info', text1: 'Note', duration: 3000 });
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  type: ToastType;
  text1: string;
  text2?: string;
  duration?: number; // ms, default 4000
}

// ─── Singleton event emitter (no external dependency) ────────────────────────

type Listener = (opts: ToastOptions) => void;
const listeners: Set<Listener> = new Set();

export function showToast(opts: ToastOptions) {
  listeners.forEach((fn) => fn(opts));
}

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  ToastType,
  { bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  success: { bg: '#059669', icon: 'checkmark-circle' },
  error:   { bg: '#DC2626', icon: 'alert-circle' },
  info:    { bg: '#5B4DFF', icon: 'information-circle' },
  warning: { bg: '#D97706', icon: 'warning' },
};

// ─── ToastItem — individual animated toast ───────────────────────────────────

interface ToastItem extends ToastOptions {
  id: number;
}

function ToastBubble({
  item,
  onDone,
}: {
  item: ToastItem;
  onDone: (id: number) => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cfg = TYPE_CONFIG[item.type];
  const duration = item.duration ?? 4000;

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -20, duration: 250, useNativeDriver: true }),
    ]).start();
    
    // Guarantee removal even if animation callback fails on Android
    setTimeout(() => onDone(item.id), 260);
  }, [item.id, onDone, opacity, translateY]);

  useEffect(() => {
    // Fade in
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    // Auto-dismiss after duration
    timerRef.current = setTimeout(dismiss, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismiss, duration, opacity, translateY]);

  return (
    <Animated.View
      style={[styles.bubble, { opacity, transform: [{ translateY }] }]}
    >
      <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={20} color="#fff" />
      </View>
      <View style={styles.textBox}>
        <Text style={styles.text1} numberOfLines={2}>
          {item.text1}
        </Text>
        {!!item.text2 && (
          <Text style={styles.text2} numberOfLines={2}>
            {item.text2}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

// ─── ToastContainer — render this ONCE at the app root ───────────────────────

let _id = 0;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler: Listener = (opts) => {
      const id = ++_id;
      setToasts((prev) => [...prev.slice(-2), { ...opts, id }]); // max 3 at a time
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  // Calculate top offset securely
  const topOffset = Platform.OS === 'android'
    ? (StatusBar.currentHeight ?? 24) + 12
    : 60;

  return (
    <View
      style={[styles.container, { top: topOffset }]}
      pointerEvents="none"
    >
      {toasts.map((t) => (
        <ToastBubble key={t.id} item={t} onDone={remove} />
      ))}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
    paddingHorizontal: 16,
    pointerEvents: 'none',
  } as any,
  bubble: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(15,14,26,0.08)',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  textBox: { flex: 1 },
  text1: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#0F0E1A',
    lineHeight: 20,
  },
  text2: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#6F6D78',
    marginTop: 2,
    lineHeight: 18,
  },
});
