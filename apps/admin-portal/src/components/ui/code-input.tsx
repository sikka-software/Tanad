import { DiamondPlus, Hash, Shuffle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CodeInputProps = {
  children: React.ReactNode;
  onSerial: () => void;
  onRandom: () => void;
};

const CodeInput = ({ children, onSerial, onRandom }: CodeInputProps) => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="relative">
      {children}
      <DropdownMenu dir={locale === "ar" ? "rtl" : "ltr"}>
        <DropdownMenuTrigger asChild>
          <Button size="icon_sm" type="button" variant="ghost" className="absolute end-0.5 top-0.5">
            <Hash className="size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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
