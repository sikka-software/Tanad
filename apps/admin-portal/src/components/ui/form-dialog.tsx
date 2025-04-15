import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  formId: string;
  onCancel?: () => void;
  cancelText?: string;
  submitText?: string;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  children,
  formId,
  onCancel,
}: FormDialogProps) {
  const t = useTranslations();
  const { locale } = useRouter();

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[80vh] flex-col gap-0 overflow-hidden !p-0"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <DialogHeader className="sticky top-0 z-10 border-b p-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        <DialogFooter className="sticky bottom-0 flex justify-end gap-2 border-t p-4">
          <Button variant="outline" onClick={handleCancel}>
            {t("General.cancel")}
          </Button>
          <Button type="submit" form={formId}>
            {t("General.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
