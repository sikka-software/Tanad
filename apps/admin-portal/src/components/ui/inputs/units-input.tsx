import { useId } from "react";

import { Input } from "@/ui/inputs/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { cn } from "@/lib/utils";

export interface UnitsInputOption {
  value: string;
  label: React.ReactNode;
}

export interface UnitsInputProps {
  label?: React.ReactNode;
  labelProps?: React.ComponentProps<typeof Label>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  selectProps?: Omit<React.ComponentProps<typeof Select>, "children"> & {
    options: UnitsInputOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    renderOption?: (option: UnitsInputOption) => React.ReactNode;
  };
  containerClassName?: string;
  inputClassName?: string;
  selectClassName?: string;
}

export default function UnitsInput({
  label,
  labelProps,
  inputProps = {},
  selectProps = { options: [] },
  containerClassName = "",
  inputClassName = "",
  selectClassName = "",
}: UnitsInputProps) {
  const id = useId();
  const {
    options,
    value: selectValue,
    defaultValue: selectDefaultValue,
    onValueChange,
    placeholder: selectPlaceholder = "Select an option",
    renderOption,
    ...restSelectProps
  } = selectProps;

  return (
    <div className={containerClassName + " *:not-first:mt-2"}>
      {label && (
        <Label htmlFor={id} {...labelProps}>
          {label}
        </Label>
      )}
      <div className="flex rounded-md shadow-xs">
        <Input
          id={id}
          className={"-me-px rounded-e-none shadow-none focus-visible:z-10 " + inputClassName}
          {...inputProps}
        />
        <Select
          value={selectValue}
          defaultValue={selectDefaultValue}
          onValueChange={onValueChange}
          {...restSelectProps}
        >
          <SelectTrigger className={cn("max-w-24 rounded-e-none", selectClassName)}>
            <SelectValue placeholder={selectPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {renderOption ? renderOption(option) : option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
