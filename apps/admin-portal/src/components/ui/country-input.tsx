import { countries } from "@root/src/lib/constants/countries";
import React from "react";

import { Combobox } from "./combobox";

interface CountryInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  dir: "rtl" | "ltr";
  ariaInvalid?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  noItems?: string;
  t?: (key: string) => string; // Optional translation function
}

const CountryInput: React.FC<CountryInputProps> = ({
  value,
  onChange,
  disabled = false,
  dir,
  ariaInvalid,
  placeholder = "Select a country",
  searchPlaceholder = "Search countries...",
  noItems = "No countries found.",
  t,
}) => {
  return (
    <Combobox
      dir={dir}
      data={countries}
      labelKey="label"
      valueKey="value"
      value={value}
      onChange={onChange}
      inputProps={{ disabled }}
      ariaInvalid={ariaInvalid}
      texts={{
        placeholder: placeholder,
        searchPlaceholder: searchPlaceholder,
        noItems: noItems,
      }}
      renderOption={(item) => <div>{dir === "rtl" ? item.arabic_label : item.label}</div>}
      renderSelected={(item) => <div>{dir === "rtl" ? item.arabic_label : item.label}</div>}
    />
  );
};

export default CountryInput;
