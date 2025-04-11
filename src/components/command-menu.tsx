import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  Building2,
  Calendar,
  CircleDollarSign,
  FileText,
  Briefcase,
  Users,
  Settings,
  Search,
  Building,
  LayoutDashboard,
} from "lucide-react";

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

type ShortcutCommand = {
  key: string;
  path: string;
  metaKey?: boolean;
};

export function CommandMenu({ dir }: { dir: "ltr" | "rtl" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
          s.key.toLowerCase() === e.key.toLowerCase() &&
          (!s.metaKey || (e.metaKey || e.ctrlKey))
      );

      if (shortcut) {
        e.preventDefault();
        if (shortcut.path) {
          router.push(shortcut.path);
        } else {
          // Toggle command menu for ⌘K
          setOpen((open) => !open);
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [router, shortcuts]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0">
        <Command
          className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-item]_svg]:w-5] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5"
          dir={dir}
        >
          <CommandInput placeholder={tGeneral("search")} />
          <CommandList>
            <CommandEmpty>{tGeneral("no_results")}</CommandEmpty>
            <CommandGroup heading={t("Navigation.main")}>
              <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>{t("Dashboard.title")}</span>
                <CommandShortcut>⌘D</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/clients"))}>
                <Users className="mr-2 h-4 w-4" />
                <span>{t("Clients.title")}</span>
                <CommandShortcut>⌘C</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/jobs"))}>
                <Briefcase className="mr-2 h-4 w-4" />
                <span>{t("Jobs.title")}</span>
                <CommandShortcut>⌘J</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={t("Navigation.resources")}>
              <CommandItem onSelect={() => runCommand(() => router.push("/employees"))}>
                <Building2 className="mr-2 h-4 w-4" />
                <span>{t("HumanResources.title")}</span>
                <CommandShortcut>⌘E</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/expenses"))}>
                <CircleDollarSign className="mr-2 h-4 w-4" />
                <span>{t("Expenses.title")}</span>
                <CommandShortcut>⌘X</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/invoices"))}>
                <FileText className="mr-2 h-4 w-4" />
                <span>{t("Invoices.title")}</span>
                <CommandShortcut>⌘I</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={t("Navigation.organization")}>
              <CommandItem onSelect={() => runCommand(() => router.push("/companies"))}>
                <Building className="mr-2 h-4 w-4" />
                <span>{t("Companies.title")}</span>
                <CommandShortcut>⌘O</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/calendar"))}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>{t("Calendar.title")}</span>
                <CommandShortcut>⌘L</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t("Settings.title")}</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
