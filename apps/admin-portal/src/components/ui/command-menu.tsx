import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/ui/command";
import { Dialog, DialogContent } from "@/ui/dialog";

import { useMainStore } from "@/hooks/main.store";

import { commandList } from "@/lib/command-list";

import { Button } from "./button";

type ShortcutCommand = {
  key: string;
  path: string;
  metaKey?: boolean;
};

export function CommandMenu({ dir }: { dir: "ltr" | "rtl" }) {
  const router = useRouter();

  const { openCommandMenu, setOpenCommandMenu } = useMainStore();
  const t = useTranslations();
  const locale = useLocale();
  const tGeneral = useTranslations("General");

  // Define all shortcuts and their corresponding paths
  const shortcuts: ShortcutCommand[] = [
    { key: "k", path: "", metaKey: true }, // Command menu toggle
    { key: "d", path: "/dashboard", metaKey: true },
    { key: "c", path: "/clients", metaKey: true },
    { key: "j", path: "/jobs", metaKey: true },
    { key: "e", path: "/employees", metaKey: true },
    { key: "x", path: "/expenses", metaKey: true },
    { key: "p", path: "/products", metaKey: true },
    { key: "i", path: "/invoices", metaKey: true },
    { key: "o", path: "/companies", metaKey: true },
    { key: "l", path: "/activity", metaKey: true },
    { key: "a", path: "/analytics", metaKey: true },
    { key: "s", path: "/settings", metaKey: true },
  ];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Find matching shortcut
      const shortcut = shortcuts.find(
        (s) =>
          s.key.toLowerCase() === e.key?.toLowerCase() && (!s.metaKey || e.metaKey || e.ctrlKey),
      );

      if (!shortcut) return;

      // Handle command menu toggle (⌘K) separately
      if (!shortcut.path) {
        e.preventDefault();
        setOpenCommandMenu(!openCommandMenu);
        return;
      }

      // Only handle other shortcuts when menu is open
      if (openCommandMenu) {
        e.preventDefault();
        router.push(shortcut.path);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [router, shortcuts, openCommandMenu, setOpenCommandMenu]);

  const runCommand = (command: () => void) => {
    setOpenCommandMenu(false);
    command();
  };

  // Get the English label from the translation key
  const getEnglishLabel = (translationKey: string) => {
    return translationKey.split(".")[1];
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <Dialog open={openCommandMenu} onOpenChange={setOpenCommandMenu}>
      <DialogContent className="max-w-xl overflow-hidden p-0" dir={locale === "ar" ? "rtl" : "ltr"}>
        <Command
          className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-item]_svg]:w-5] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5"
          dir={dir}
        >
          <CommandInput placeholder={tGeneral("search")} />
          <CommandList>
            <CommandEmpty>{tGeneral("no_results")}</CommandEmpty>
            {commandList.map((group, groupIndex) => (
              <div key={groupIndex}>
                <CommandGroup heading={t(group.heading)}>
                  {group.items.map((item) => {
                    const englishLabel = getEnglishLabel(item.label);
                    const arabicLabel = t(item.label);
                    return (
                      <CommandItem
                        key={item.href}
                        onSelect={() => runCommand(() => router.push(item.href))}
                        value={`${englishLabel} ${arabicLabel}`}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="group flex flex-row items-center justify-between"
                      >
                        <div className="flex flex-row items-center">
                          <item.icon className="me-2 h-4 w-4" />
                          <span>{arabicLabel}</span>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                          {item.addHref && (
                            <Link href={item.addHref}>
                              <Button
                                variant="outline"
                                size="icon"
                                className="relative size-7 translate-x-4 cursor-pointer opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                                type="button"
                              >
                                <Plus className="size-4" />
                              </Button>
                            </Link>
                          )}
                          <CommandShortcut>{item.shortcut}</CommandShortcut>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
              </div>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
