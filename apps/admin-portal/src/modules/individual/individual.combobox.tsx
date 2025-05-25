import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { Control, ControllerRenderProps } from "react-hook-form";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { FormControl, FormMessage } from "@/ui/form";
import { FormItem, FormLabel } from "@/ui/form";
import { FormField } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";

import IndividualForm from "@/individual/individual.form";
import useIndividualStore from "@/individual/individual.store";
import { Individual } from "@/individual/individual.type";

interface IndividualComboboxProps {
  label: string;
  control: Control<any>;
  individuals: Individual[];
  loadingCombobox: boolean;
  isSaving: boolean;
  disabled?: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  onIndividualSelected?: (field: ControllerRenderProps<any, string>, value: any) => void;
  formName: string;
}

const IndividualCombobox = ({
  label,
  control,
  individuals,
  loadingCombobox,
  isSaving,
  isDialogOpen,
  setIsDialogOpen,
  disabled,
  formName,
  onIndividualSelected,
}: IndividualComboboxProps) => {
  const t = useTranslations();
  const locale = useLocale();

  const setIsSaving = useIndividualStore((state) => state.setIsLoading);

  const individualOptions = useMemo(
    () =>
      individuals.map((individual) => ({
        value: individual.id,
        label: individual.name,
        email: individual.email,
      })),
    [individuals],
  );

  return (
    <div>
      <FormField
        control={control}
        name={formName}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{label} *</FormLabel>
            <FormControl>
              <ComboboxAdd
                dir={locale === "ar" ? "rtl" : "ltr"}
                data={individualOptions}
                isLoading={loadingCombobox}
                defaultValue={field.value}
                onChange={(value) =>
                  onIndividualSelected
                    ? onIndividualSelected(field, value)
                    : field.onChange(value || null)
                }
                texts={{
                  placeholder: t("Pages.Individuals.select"),
                  searchPlaceholder: t("Pages.Individuals.search"),
                  noItems: t("Pages.Individuals.no_individuals_found"),
                }}
                addText={t("Pages.Individuals.add")}
                onAddClick={() => setIsDialogOpen(true)}
                disabled={disabled}
                renderOption={(option) => (
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-muted-foreground text-xs">{option.email}</span>
                  </div>
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={t("Pages.Individuals.add")}
        formId="individual-form"
        cancelText={t("General.cancel")}
        submitText={t("General.save")}
        loadingSave={isSaving}
      >
        <IndividualForm
          formHtmlId="individual-form"
          nestedForm
          onSuccess={() => {
            setIsDialogOpen(false);
            setIsSaving(false);
          }}
        />
      </FormDialog>
    </div>
  );
};

export default IndividualCombobox;
