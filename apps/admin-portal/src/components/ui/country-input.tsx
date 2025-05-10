import { Combobox } from "./combobox";

const CountryInput = ({ dir }: { dir: "rtl" | "ltr" }) => {
  return (
    <div>
      <Combobox
        dir={dir}
        data={[]}
        labelKey="label"
        valueKey="value"
        defaultValue={field.value}
        value={field.value}
        inputProps={{ disabled: isLoading }}
        texts={{
          placeholder: t("OnlineStores.form.platform.placeholder"),
          searchPlaceholder: t("OnlineStores.form.platform.search_placeholder"),
          noItems: t("OnlineStores.form.platform.no_items"),
        }}
        renderOption={(item) => <div>{t(item.label)}</div>}
        renderSelected={(item) => <div>{t(item.label)}</div>}
        onChange={field.onChange}
        ariaInvalid={!!form.formState.errors.platform}
      />
    </div>
  );
};

export default CountryInput;
