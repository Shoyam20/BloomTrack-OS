import { create } from 'zustand'

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `toast-${Date.now()}`;
    set((state) => {
      const activeToasts = [...state.toasts, { id, message, type }];
      // Keep only last 3 visible at once
      const truncated = activeToasts.slice(-3);
      return { toasts: truncated };
    });
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),
}));

export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);
  const removeToast = useToastStore((state) => state.removeToast);
  const toasts = useToastStore((state) => state.toasts);

  return {
    toasts,
    toast: {
      success: (msg) => addToast(msg, 'success'),
      error: (msg) => addToast(msg, 'error'),
      info: (msg) => addToast(msg, 'info'),
      warning: (msg) => addToast(msg, 'warning'),
    },
    removeToast
  };
};
