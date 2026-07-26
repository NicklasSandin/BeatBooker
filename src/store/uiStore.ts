import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarOpen: false,

      setTheme: (theme) => {
        set({ theme });
        const root = document.documentElement;
        if (theme === "dark") {
          root.classList.add("dark");
        } else if (theme === "light") {
          root.classList.remove("dark");
        } else {
          // system
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          if (prefersDark) {
            root.classList.add("dark");
          } else {
            root.classList.remove("dark");
          }
        }
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },
    }),
    {
      name: "beatbooker-ui",
    }
  )
);
