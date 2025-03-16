"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleAlert, Loader2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function Component({
  onConfirm,
  open,
  setOpen,
  pukla,
  loadingDelete,
}: {
  onConfirm: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  pukla?: any;
  loadingDelete: boolean;
}) {
  const t = useTranslations();
  const lang = useLocale();
  const id = useId();
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (open) {
      setInputValue("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
            aria-hidden="true"
          >
            <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              {t("MyPuklas.delete_pukla")}
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              {t("MyPuklas.delete_pukla_description", {
                pukla_name: pukla?.title,
              })}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor={id}>{t("MyPuklas.delete_pukla_label")}</Label>
            <Input
              id={id}
              type="text"
              placeholder={pukla?.title}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                {t("General.cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="flex-1"
              disabled={inputValue !== pukla?.title}
            >
              {loadingDelete ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                t("General.delete")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
