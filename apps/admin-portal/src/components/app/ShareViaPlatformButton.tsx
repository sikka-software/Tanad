import { ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";
import React from "react";

type ShareViaPlatformButtonType = {
  handleClick?: () => void;
  title?: string;
};

export const ShareViaPlatformButton: React.FC<ShareViaPlatformButtonType> = (props) => {
  const lang = useLocale();
  return (
    <div
      onClick={props.handleClick}
      className="flex cursor-pointer flex-row justify-between rounded-md p-4 transition-all hover:bg-gray-100"
    >
      <span>{props.title}</span>
      <ChevronRight className={lang === "ar" ? "rotate-180" : ""} />
    </div>
  );
};
