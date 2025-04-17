import { useEffect, useState } from "react";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

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

import { commandList } from "@/lib/command-list";

import { useMainStore } from "@/hooks/main.store";

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
    { key: "l", path: "/calendar", metaKey: true },
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
    return translationKey.split(".")[0];
  };

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
                      >
                        <item.icon className="ms-2 h-4 w-4" />
                        <span>{arabicLabel}</span>
                        <CommandShortcut>{item.shortcut}</CommandShortcut>
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
