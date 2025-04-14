import React from "react";
// UI
import { Chip } from "@/components/ui/chip";
// Utils
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type LinkTypeButtonProps = {
  onSelect?: () => void;
  name?: string;
  icon?: React.ReactNode;
  soon?: boolean;
  locked?: boolean;
};

export const LinkTypeButton: React.FC<LinkTypeButtonProps> = ({
  onSelect,
  icon,
  soon,
  locked,
  name,
  ...props
}) => {
  const t = useTranslations();
  return (
    <div
      onClick={soon ? undefined : onSelect}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded border p-4 text-center ",
        !soon && !locked && "hover:bg-linksSectionBG  cursor-pointer",
      )}
    >
      {icon}
      {name}
      {soon && (
        <div className="absolute select-none flex h-full w-full items-center justify-center rounded bg-black bg-opacity-50">
          <Chip label={t("General.soon")} color="oceanic" />
        </div>
      )}
    </div>
  );
};
