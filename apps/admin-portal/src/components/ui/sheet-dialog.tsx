import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { Button } from "@/ui/button";

import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "./sheet";

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  formId: string;
  onCancel?: () => void;
  cancelText?: string;
  submitText?: string;
  loadingSave?: boolean;
  dummyData?: () => void;
}

export function FormSheet({
  open,
  onOpenChange,
  title,
  children,
  formId,
  onCancel,
  loadingSave,
  dummyData,
}: FormSheetProps) {
  const t = useTranslations();
  const { locale } = useRouter();

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex flex-col gap-0 overflow-hidden !p-0 w-[540px]"
        dir={locale === "ar" ? "rtl" : "ltr"}
        side={locale === "ar" ? "left" : "right"}
      >
        <SheetHeader className="sticky top-0 z-10 border-b p-4">
          <SheetTitle>
            {title}

            {dummyData && (
              <Button variant="outline" size="sm" className="ms-4" onClick={dummyData}>
                Generate
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">{children}</div>
        <SheetFooter className="sticky bottom-0 flex justify-end gap-2 border-t p-4">
          <Button variant="outline" onClick={handleCancel}>
            {t("General.cancel")}
          </Button>
          <Button type="submit" form={formId} className="min-w-24" disabled={loadingSave}>
            {loadingSave ? <Loader2 className="size-4 animate-spin" /> : t("General.save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
