import React from "react";
import { useTranslations, useLocale } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import PuklaCard from "@/components/ui/pukla-card";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";

import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useMainStore } from "@/hooks/main.store";

type ChangePuklaDialogProps = {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  allPuklas?: any[];
};

export const ChangePuklaDialog: React.FC<ChangePuklaDialogProps> = ({
  openDialog,
  setOpenDialog,
  allPuklas,
}) => {
  const t = useTranslations();
  const lang = useLocale();
  const size = useBreakpoint();
  const setSelectedPukla = useMainStore((state) => state.setSelectedPukla);
  const currentPukla = useMainStore((state) => state.selectedPukla);
  const handlePuklaChange = (value: string) => {
    const selectedPukla = allPuklas?.find((p) => p.id === value);
    if (selectedPukla) {
      setSelectedPukla(selectedPukla);
    }
    setOpenDialog(false);
  };

  if (size > 600) {
    return (
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent dir={lang === "ar" ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t("Editor.change-pukla")}</DialogTitle>
          </DialogHeader>
          <Combobox
            direction={lang === "ar" ? "rtl" : "ltr"}
            texts={{ searchPlaceholder: t("General.search") }}
            // labelProps={{ required: true }}
            data={allPuklas || []}
            defaultValue={currentPukla?.id}
            valueKey="id"
            labelKey="title"
            onChange={handlePuklaChange}
            renderOption={(item) => (
              <div className="flex flex-row w-full justify-between">
                <div className="w-full"> {item.title}</div>
                <Badge variant="secondary" className="text-nowrap">
                  {t("MyPuklas.links")} {item.link_count}
                </Badge>
              </div>
            )}
          />
        </DialogContent>
      </Dialog>
    );
  } else {
    return (
      <Sheet open={openDialog} onOpenChange={setOpenDialog}>
        <SheetContent side="bottom">
          <SheetHeader className="mb-4">
            <SheetTitle>{t("Editor.change-pukla")}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto">
            {allPuklas?.map((pukla) => (
              <PuklaCard
                key={pukla.id}
                pukla={pukla}
                linkCount={pukla?.link_count || 0}
                onClick={() => handlePuklaChange(pukla.id)}
                isSelected={pukla.id === currentPukla?.id}
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }
};
