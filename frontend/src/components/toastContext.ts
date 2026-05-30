// frontend/src/components/toastContext.ts

import { createContext } from 'react';
import type { ToastType } from '../types';

export type ToastContextValue = {
  notify: (type: ToastType, message: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);
