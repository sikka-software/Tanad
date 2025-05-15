import { DiamondPlus, Hash, Shuffle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

import { cn } from "@/lib/utils";

type CodeInputProps = {
  children: React.ReactNode;
  onSerial: () => void;
  onRandom: () => void;
  inCell?: boolean;
};

const CodeInput = ({ children, onSerial, onRandom, inCell }: CodeInputProps) => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="relative">
      {children}
      <DropdownMenu dir={locale === "ar" ? "rtl" : "ltr"}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon_sm"
            type="button"
            variant="ghost"
            className={cn(
              "absolute end-0.5 top-0.5 cursor-pointer",
              inCell && "top-1 opacity-50 transition-opacity hover:opacity-100",
            )}
          >
            <Hash className="size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onSerial}>
            <DiamondPlus /> {t("General.next_number")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRandom}>
            <Shuffle /> {t("General.random")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CodeInput;
