// components/ui/theme-toggle.tsx
"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Avoid SSR hydration flashing by ensuring execution strictly post-mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />; 
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-xl h-9 w-9 border border-border/50 bg-card hover:bg-muted cursor-pointer shadow-sm transition-all duration-200"
      aria-label="Toggle display layout theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-warning fill-warning/10 animate-pulse" />
      ) : (
        <Moon className="h-4 w-4 text-primary fill-primary/10" />
      )}
    </Button>
  );
}