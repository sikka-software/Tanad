import { Eye } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { ScrollArea } from "@/ui/scroll-area";

import { CodeTabs } from "@/components/animate-ui/components/code-tabs";

import { useActivityLogStore } from "./activity.store";

export function ActivityLogDialog() {
  const t = useTranslations();
  const locale = useLocale();
  const { isDialogOpen, selectedLog, closeDialog } = useActivityLogStore();

  if (!selectedLog) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[600px]" dir={locale === "ar" ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t("ActivityLogs.dialog.title")}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]" dir={locale === "ar" ? "rtl" : "ltr"}>
          <div className="grid gap-4 p-4">
            {Object.entries(selectedLog)
              .sort(([keyA], [keyB]) => {
                if (keyA === "details") return 1; // Move 'details' to the end
                if (keyB === "details") return -1; // Move 'details' to the end
                return 0; // Keep original order for others
              })
              .map(([key, value]) => {
                const details_code = {
                  json: JSON.stringify(value, null, 2),
                };
                return (
                  <div key={key} className="grid grid-cols-3 items-center gap-4">
                    <span className="text-muted-foreground h-full text-sm font-medium">
                      {t(`ActivityLogs.fields.${key}` as any, {}, {
                        defaultValue: key.replace(/_/g, " "),
                      } as any)}
                    </span>
                    {key === "details" ? (
                      <div className="col-span-2" dir="ltr">
                        <CodeTabs codes={details_code} />
                      </div>
                    ) : (
                      <span className="col-span-2 text-sm">
                        {typeof value === "object" && value !== null
                          ? JSON.stringify(value, null, 2)
                          : String(value ?? "N/A")}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {t("General.close")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
