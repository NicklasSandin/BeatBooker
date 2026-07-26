"use client";

import * as React from "react";
import { useUIStore } from "@/store/uiStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  React.useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return <>{children}</>;
}
