import { useLocale, useTranslations } from "next-intl";

import { CommandSelect } from "@/ui/command-select";

import { cn } from "@/lib/utils";

import CodeInput from "../ui/code-input";
import { Input } from "../ui/input";

const CodeCell = ({
  code,
  onCodeChange,
  onSerial,
  onRandom,
}: {
  code: string;
  onCodeChange: (value: string) => void;
  onSerial: () => void;
  onRandom: () => void;
}) => {
  const lang = useLocale();
  const t = useTranslations();
  const cellValue = code;
  return (
    <div>
      <CodeInput
        inCell
        onSerial={onSerial}
    
        onRandom={onRandom}
        // () => {
        // // if (colDef.onRandom) {
        // //   colDef.onRandom(rowData, rowIndex);
        // // } else if (onEdit) {
        // //   const random = Math.floor(100000 + Math.random() * 900000).toString();
        // //   onEdit(rowId, colKey as keyof T, random as T[keyof T]);
        // // }
      >
        <Input
          inCell
          value={cellValue || ""}
          // disabled={isDisabled}
          style={{ minHeight: 36 }}
          // onFocus={(e) => handleCellFocus(e, groupKey, rowData, colDef)}
          // onKeyDown={(e) => {
          //   if (
          //     (e.ctrlKey || e.metaKey) &&
          //     ["a", "c", "x", "z", "v"].includes(e.key.toLowerCase())
          //   ) {
          //     return;
          //   }
          //   handleKeyDown(e, colDef);
          // }}
          // onPaste={(e) => handlePaste(e, colDef)}
          // onInput={(e) => handleCellInput(e, groupKey, rowData, colDef)}
          // onBlur={(e) => handleCellBlur(e, groupKey, rowData, colDef)}
          // onChange={(e) => {
          //   if (onEdit) {
          //     onEdit(rowId, colKey as keyof T, e.target.value as T[keyof T]);
          //   }
          // }}
        />
      </CodeInput>
    </div>
  );
};

export default CodeCell;
