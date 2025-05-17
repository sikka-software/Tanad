import { useLocale } from "next-intl";

import { CommandSelect } from "@/ui/command-select";

const SelectCell = ({
  options,
  onChange,
  cellValue,
  renderOption,
  renderSelected,
}: {
  options: any[];
  onChange: (value: any) => void;
  cellValue: any;
  renderOption?: (item: any) => React.ReactNode;
  renderSelected?: (item: any) => React.ReactNode;
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
        popoverClassName="w-full  w-[var(--radix-select-trigger-width)] max-w-[500px]"
        buttonClassName="bg-transparent w-full max-w-full"
        valueKey="value"
        labelKey="label"
        onChange={onChange}
        texts={{ placeholder: ". . ." }}
        renderOption={renderOption}
        renderSelected={renderSelected}
        ariaInvalid={false}
      />
    </div>
  );
};

export default SelectCell;
