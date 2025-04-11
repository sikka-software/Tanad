import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
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
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { commandList } from "@/lib/command-list";

type ShortcutCommand = {
  key: string;
  path: string;
  metaKey?: boolean;
};

export function CommandMenu({ dir }: { dir: "ltr" | "rtl" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const t = useTranslations();
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
          s.key.toLowerCase() === e.key.toLowerCase() && (!s.metaKey || e.metaKey || e.ctrlKey),
      );

      if (!shortcut) return;

      // Handle command menu toggle (⌘K) separately
      if (!shortcut.path) {
        e.preventDefault();
        setOpen((open) => !open);
        return;
      }

      // Only handle other shortcuts when menu is open
      if (open) {
        e.preventDefault();
        router.push(shortcut.path);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [router, shortcuts, open]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  // Helper function to check if an item matches the search term in either language
  const itemMatchesSearch = (item: { label: string }, searchTerm: string) => {
    const normalizedSearch = searchTerm.toLowerCase();
    const translatedLabel = t(item.label).toLowerCase();
    const originalLabel = item.label.split(".")[0].toLowerCase(); // Get original English label
    
    return translatedLabel.includes(normalizedSearch) || originalLabel.includes(normalizedSearch);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0">
        <Command
          className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-item]_svg]:w-5] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5"
          dir={dir}
        >
          <CommandInput 
            placeholder={tGeneral("search")} 
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>{tGeneral("no_results")}</CommandEmpty>
            {commandList.map((group) => (
              <>
                <CommandGroup heading={group.heading}>
                  {group.items
                    .filter((item) => !searchTerm || itemMatchesSearch(item, searchTerm))
                    .map((item) => (
                      <CommandItem
                        key={item.href}
                        onSelect={() => runCommand(() => router.push(item.href))}
                      >
                        <item.icon className="ms-2 h-4 w-4" />
                        <span>{t(item.label)}</span>
                        <CommandShortcut>{item.shortcut}</CommandShortcut>
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
