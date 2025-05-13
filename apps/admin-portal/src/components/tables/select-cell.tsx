import { useLocale, useTranslations } from "next-intl";
import { ChangeEvent } from "react";

import CodeInput from "../ui/code-input";
import { CommandSelect } from "../ui/command-select";
import { Input } from "../ui/input";

const SelectCell = ({
  options,
  onChange,
  cellValue,
}: {
  options: any[];
  onChange: (value: any) => void;
  cellValue: any;
}) => {
  const lang = useLocale();
  return (
    <div>
      <CommandSelect
        dir={lang === "ar" ? "rtl" : "ltr"}
        data={options}
        inCell
        isLoading={false}
        defaultValue={String(cellValue)}
        popoverClassName="w-full max-w-full"
        buttonClassName="bg-transparent w-full max-w-full"
        valueKey="value"
        labelKey="label"
        onChange={onChange}
        texts={{ placeholder: ". . ." }}
        renderOption={(item) => <div>{item.label}</div>}
        ariaInvalid={false}
      />
    </div>
  );
};

export default SelectCell;
