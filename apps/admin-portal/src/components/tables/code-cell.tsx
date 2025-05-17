import { Shuffle } from "lucide-react";
import { DiamondPlus } from "lucide-react";
import { Hash } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ChangeEvent } from "react";

import { Button } from "@/ui/button";
import { DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { DropdownMenu, DropdownMenuContent } from "@/ui/dropdown-menu";
import { Input } from "@/ui/inputs/input";

import { cn } from "@/lib/utils";

const CodeCell = ({
  code,
  onCodeChange,
  onSerial,
  onRandom,
  onChange,
}: {
  code: string;
  onCodeChange: (value: string) => void;
  onSerial: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRandom: () => void;
}) => {
  const lang = useLocale();
  const t = useTranslations();
  return (
    <div className="relative">
      <Input inCell style={{ minHeight: 36 }} value={code} onChange={onChange} />
      <DropdownMenu dir={lang === "ar" ? "rtl" : "ltr"}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon_sm"
            type="button"
            variant="ghost"
            className={cn(
              "absolute end-0.5 top-0.5 cursor-pointer",
              "top-1 opacity-50 transition-opacity hover:opacity-100",
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

export default CodeCell;

// import { useLocale, useTranslations } from "next-intl";
// import { ChangeEvent } from "react";

// import CodeInput from "../ui/inputs/code-input";
// import { Input } from "../ui/inputs/input";

// const CodeCell = ({
//   code,
//   onCodeChange,
//   onSerial,
//   onRandom,
//   onChange,
// }: {
//   code: string;
//   onCodeChange: (value: string) => void;
//   onSerial: () => void;
//   onChange: (e: ChangeEvent<HTMLInputElement>) => void;
//   onRandom: () => void;
// }) => {
//   const lang = useLocale();
//   const t = useTranslations();
//   const cellValue = code;
//   return (
//     <div>
//       <CodeInput
//         inCell
//         onSerial={onSerial}
//         onRandom={onRandom}
//         inputProps={{
//           // inCell: true,
//           value: cellValue || "",
//           onChange: onChange,
//           // disabled: isDisabled,
//           style: { minHeight: 36 },
//           // onFocus: (e) => handleCellFocus(e, groupKey, rowData, colDef),
//           // onKeyDown: (e) => {
//           //   if (
//           //     (e.ctrlKey || e.metaKey) &&
//           //     ["a", "c", "x", "z", "v"].includes(e.key.toLowerCase())
//           //   ) {
//           //     return;
//           //   }
//           //   handleKeyDown(e, colDef);
//           // },
//           // onPaste: (e) => handlePaste(e, colDef),
//           // onInput: (e) => handleCellInput(e, groupKey, rowData, colDef),
//           // onBlur: (e) => handleCellBlur(e, groupKey, rowData, colDef),
//         }}
//       />
//     </div>
//   );
// };

// export default CodeCell;
