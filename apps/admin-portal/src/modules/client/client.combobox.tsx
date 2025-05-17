import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { Control, ControllerRenderProps } from "react-hook-form";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { FormControl, FormMessage } from "@/ui/form";
import { FormItem, FormLabel } from "@/ui/form";
import { FormField } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";

import ClientForm from "@/client/client.form";
import useClientStore from "@/client/client.store";
import { Client } from "@/client/client.type";

interface ClientComboboxProps {
  label: string;
  control: Control<any>;
  clients: Client[];
  loadingCombobox: boolean;
  isSaving: boolean;
  disabled?: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  onClientSelected?: (field: ControllerRenderProps<any, string>, value: any) => void;
  formName: string;
}

const ClientCombobox = ({
  label,
  control,
  clients,
  loadingCombobox,
  isSaving,
  isDialogOpen,
  setIsDialogOpen,
  disabled,
  formName,
  onClientSelected,
}: ClientComboboxProps) => {
  const t = useTranslations();
  const locale = useLocale();

  const setIsSaving = useClientStore((state) => state.setIsLoading);

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client.id,
        label: client.name,
        email: client.email,
      })),
    [clients],
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
                data={clientOptions}
                isLoading={loadingCombobox}
                defaultValue={field.value}
                onChange={(value) =>
                  onClientSelected ? onClientSelected(field, value) : field.onChange(value || null)
                }
                texts={{
                  placeholder: t("Pages.Clients.select"),
                  searchPlaceholder: t("Pages.Clients.search"),
                  noItems: t("Pages.Clients.no_clients_found"),
                }}
                addText={t("Pages.Clients.add")}
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
        title={t("Pages.Clients.add")}
        formId="client-form"
        cancelText={t("General.cancel")}
        submitText={t("General.save")}
        loadingSave={isSaving}
      >
        <ClientForm
          formHtmlId="client-form"
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

export default ClientCombobox;
