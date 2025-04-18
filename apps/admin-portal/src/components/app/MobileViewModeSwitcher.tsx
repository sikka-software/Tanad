import React from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type MobileViewModeSwitcherType = {
  mode?: any;
  onModeChange?: any;
  makeRoomForAnnouncement?: boolean;
};

const MobileViewModeSwitcher: React.FC<MobileViewModeSwitcherType> = (
  props
) => {
  const t = useTranslations();
  return (
    <div
      className={cn(
        "fixed  left-4 flex items-center justify-center rounded border bg-white shadow-xl dark:bg-black",
        props.makeRoomForAnnouncement ? "bottom-20" : "bottom-4"
      )}
      style={{ width: "calc(100% - 32px)" }}
    ></div>
  );
};

export default MobileViewModeSwitcher;
