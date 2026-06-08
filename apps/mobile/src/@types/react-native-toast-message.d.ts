// Minimal TypeScript declarations for 'react-native-toast-message'

declare module 'react-native-toast-message' {
  import * as React from 'react';
  export type ToastConfig = any;
  export type ToastProps = any;
  export type BaseToastProps = any;
  const Toast: React.ComponentType<any> & {
    show(options: any): void;
    hide(): void;
  };
  export { Toast };
  export function show(options: any): void;
  export function hide(): void;
  export default Toast;
}
