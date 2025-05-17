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

import { useFormField } from "../form";
import { Input } from "./input";

type CodeInputProps = {
  onSerial: () => void;
  onRandom: () => void;
  inCell?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const CodeInput = ({ onSerial, onRandom, inCell, inputProps }: CodeInputProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const { error } = useFormField();

  return (
    <div className="relative">
      <Input aria-invalid={error !== undefined} inCell={inCell} {...inputProps} />
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
