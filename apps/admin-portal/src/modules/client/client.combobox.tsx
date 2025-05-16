import { useLocale, useTranslations } from "next-intl";
import { Control } from "react-hook-form";

import { ComboboxAdd } from "@/components/ui/comboboxes/combobox-add";
import { FormControl, FormMessage } from "@/components/ui/form";
import { FormItem, FormLabel } from "@/components/ui/form";
import { FormField } from "@/components/ui/form";
import FormDialog from "@/components/ui/form-dialog";

import { ClientForm } from "./client.form";
import useClientStore from "./client.store";
import { Client } from "./client.type";

interface ClientComboboxProps {
  label: string;
  control: Control<any>;
  clients: Client[];
  loadingCombobox: boolean;
  isClientSaving: boolean;

  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

const ClientCombobox = ({
  label,
  control,
  clients,
  loadingCombobox,
  isClientSaving,
  isDialogOpen,
  setIsDialogOpen,
}: ClientComboboxProps) => {
  const t = useTranslations();
  const locale = useLocale();

  const setIsClientSaving = useClientStore((state) => state.setIsLoading);

  return (
    <div>
      <FormField
        control={control}
        name="client_id"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{label} *</FormLabel>
            <FormControl>
              <ComboboxAdd
                dir={locale === "ar" ? "rtl" : "ltr"}
                data={clients.map((client) => ({
                  value: client.id,
                  label: client.name,
                  email: client.email,
                }))}
                ariaInvalid={fieldState.error !== undefined}
                isLoading={loadingCombobox}
                defaultValue={field.value}
                onChange={(value) => field.onChange(value || null)}
                texts={{
                  placeholder: t("Pages.Clients.select"),
                  searchPlaceholder: t("Pages.Clients.search"),
                  noItems: t("Pages.Clients.no_clients_found"),
                }}
                addText={t("Pages.Clients.add")}
                onAddClick={() => setIsDialogOpen(true)}
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
        loadingSave={isClientSaving}
      >
        <ClientForm
          formHtmlId="client-form"
          nestedForm
          onSuccess={() => {
            setIsDialogOpen(false);
            setIsClientSaving(false);
          }}
        />
      </FormDialog>
    </div>
  );
};

export default ClientCombobox;
