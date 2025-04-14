import React from "react";
import { useTranslations } from "next-intl";
import { MoreVertical, Share, Flag } from "lucide-react";

import { cn, shouldUseLightContent } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const MoreOptions = ({
  onShare,
  onReport,
  backgroundColor,
}: {
  onShare: () => void;
  onReport: () => void;
  backgroundColor: string;
}) => {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations();
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="absolute top-4 right-4" asChild>
        <Button
          variant="outline"
          className={cn(
            "size-8 bg-transparent border-none",
            shouldUseLightContent(backgroundColor)
              ? "hover:bg-transparent/90"
              : "hover:bg-transparent/10"
          )}
          style={{
            color: shouldUseLightContent(backgroundColor) ? "white" : "black",
          }}
          size="icon"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="shadow-none"
        style={{
          borderColor: shouldUseLightContent(backgroundColor)
            ? "white"
            : "black",
          backgroundColor: backgroundColor,
          color: shouldUseLightContent(backgroundColor) ? "white" : "black",
        }}
      >
        <DropdownMenuItem
          onClick={onShare}
          className={cn(
            "hover:!bg-transparent/10 !bg-transparent",
            shouldUseLightContent(backgroundColor)
              ? "text-white hover:!text-white"
              : "text-black hover:!text-black"
          )}
        >
          <Share className="w-4 h-4" />
          {t("General.share")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onReport}
          className={cn(
            "hover:!bg-transparent/10 !bg-transparent",
            shouldUseLightContent(backgroundColor)
              ? "text-white hover:!text-white"
              : "text-black hover:!text-black"
          )}
        >
          <Flag className="w-4 h-4" />
          {t("General.report")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MoreOptions;
