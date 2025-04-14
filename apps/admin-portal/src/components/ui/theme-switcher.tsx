"use client";

import { useTheme } from "next-themes";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ThemeSwitcher({ defaultSize = false }: { defaultSize?: boolean }) {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      variant="outline"
      size="icon"
      className={defaultSize ? "" : "size-8"}
    >
      {resolvedTheme === "dark" ? <Moon /> : <Sun />}
    </Button>
  );
}
