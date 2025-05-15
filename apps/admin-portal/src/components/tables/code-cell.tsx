import { useLocale, useTranslations } from "next-intl";
import { ChangeEvent } from "react";

import CodeInput from "../ui/inputs/code-input";
import { Input } from "../ui/inputs/input";

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
  const cellValue = code;
  return (
    <div>
      <CodeInput inCell onSerial={onSerial} onRandom={onRandom}>
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
          onChange={onChange}
        />
      </CodeInput>
    </div>
  );
};

export default CodeCell;
