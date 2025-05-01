import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet";

import { SharingStage } from "@/components/app/SharingStage";
import { useBreakpoint } from "@/hooks/use-breakpoint";

type ShareDialogType = {
  slug?: any;
  id?: any;
  theme?: "light" | "dark";
  noPukla?: boolean;
  openDialog?: any;
  setOpenDialog?: any;
};

export const ShareDialog: React.FC<ShareDialogType> = ({
  openDialog,
  setOpenDialog,
  ...props
}) => {
  const size = useBreakpoint();

  if (size > 600) {
    return (
      <Dialog open={openDialog} onOpenChange={() => setOpenDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>@{props.slug}</DialogTitle>
          </DialogHeader>
          <SharingStage puklaName={props.slug} />
        </DialogContent>
      </Dialog>
    );
  } else {
    return (
      <Sheet open={openDialog} onOpenChange={() => setOpenDialog(false)}>
        <SheetContent
          side="bottom"
          className="md:hawa-inset-x-[300px] hawa-rounded-t hawa-border"
        >
          <SheetHeader className="mb-4">
            <SheetTitle>@{props.slug}</SheetTitle>
          </SheetHeader>
          <SharingStage puklaName={props.slug} />
        </SheetContent>
      </Sheet>
    );
  }
};
