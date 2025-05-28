import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import BooleanTabs from "@/ui/boolean-tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import CodeInput from "@/ui/inputs/code-input";
import { Input } from "@/ui/inputs/input";
import PhoneInput from "@/ui/inputs/phone-input";
import UnitsInput from "@/ui/inputs/units-input";

import { AddressFormSection } from "@/components/forms/address-form-section";
import { DocumentsFormSection } from "@/components/forms/documents-form-section";
import NotesSection from "@/components/forms/notes-section";

import { addressSchema } from "@/lib/schemas/address.schema";
import { getNotesValue } from "@/lib/utils";

import { CommonStatus, ModuleFormProps } from "@/types/common.type";

import { useCreateOffice, useOffices, useUpdateOffice } from "@/office/office.hooks";
import useOfficeStore from "@/office/office.store";
import { OfficeCreateData, OfficeUpdateData } from "@/office/office.type";

import EmployeeCombobox from "@/employee/employee.combobox";
import { useEmployees } from "@/employee/employee.hooks";
import useEmployeeStore from "@/employee/employee.store";

import { offices } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

const createOfficeSchema = (t: (key: string) => string) => {
  const OfficeSelectSchema = createInsertSchema(offices, {
    name: z.string().min(1, t("Offices.form.name.required")),
    code: z.string().optional().or(z.literal("")),
    email: z
      .string()
      .email({ message: t("Offices.form.email.invalid") })
      .optional()
      .or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    manager: z
      .string({ invalid_type_error: t("Offices.form.manager.invalid_uuid") })
      .optional()
      .nullable(),
    status: z.enum(CommonStatus, {
      message: t("CommonStatus.required"),
    }),
    capacity: z.number().optional().nullable(),
    working_hours: z.string().optional().nullable(),

    area: z.string().optional().nullable(),
    notes: z.any().optional().nullable(),
    ...addressSchema,
  });
  return OfficeSelectSchema;
};

export type OfficeFormValues = z.input<ReturnType<typeof createOfficeSchema>>;

export function OfficeForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
  nestedForm,
}: ModuleFormProps<OfficeCreateData | OfficeUpdateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const { data: offices } = useOffices();
  const { mutateAsync: createOffice } = useCreateOffice();
  const { mutateAsync: updateOffice } = useUpdateOffice();
  const isLoading = useOfficeStore((state) => state.isLoading);
  const setIsLoading = useOfficeStore((state) => state.setIsLoading);

  const { data: employees = [], isLoading: isFetchingEmployees } = useEmployees();
  const setIsEmployeeSaving = useEmployeeStore((state) => state.setIsLoading);
  const isEmployeeSaving = useEmployeeStore((state) => state.isLoading);
  const isEmployeeFormDialogOpen = useEmployeeStore((state) => state.isFormDialogOpen);
  const setIsEmployeeFormDialogOpen = useEmployeeStore((state) => state.setIsFormDialogOpen);

  const form = useForm<OfficeFormValues>({
    resolver: zodResolver(createOfficeSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      code: defaultValues?.code || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      short_address: defaultValues?.short_address || "",
      building_number: defaultValues?.building_number || "",
      street_name: defaultValues?.street_name || "",
      city: defaultValues?.city || "",
      region: defaultValues?.region || "",
      country: defaultValues?.country || "",
      zip_code: defaultValues?.zip_code || "",
      manager: defaultValues?.manager || "",
      area: defaultValues?.area || "",
      working_hours: (defaultValues?.working_hours as string) || "",

      status: defaultValues?.status || "active",
      notes: getNotesValue(defaultValues),
    },
  });

  const handleSubmit = async (data: OfficeFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }
    try {
      if (editMode && defaultValues) {
        if (!defaultValues.id) {
          console.error("Office ID missing in edit mode");
          toast.error(t("Offices.error.missing_id"));
          setIsLoading(false);
          return;
        }
        await updateOffice(
          {
            id: defaultValues.id,
            data: {
              name: data.name.trim(),
              code: data.code?.trim() || undefined,
              short_address: data.short_address?.trim() || undefined,
              building_number: data.building_number?.trim() || undefined,
              street_name: data.street_name?.trim() || undefined,
              city: data.city?.trim() || undefined,
              region: data.region?.trim() || undefined,
              country: data.country?.trim() || undefined,
              zip_code: data.zip_code?.trim() || undefined,
              area: data.area || undefined,
              status: data.status,
              notes: data.notes,
            },
          },
          {
            onSuccess: async () => {
              if (onSuccess) onSuccess();
            },
          },
        );
      } else {
        if (!enterprise?.id) {
          toast.error(t("General.error_operation"), {
            description: t("Offices.error.no_enterprise"),
          });
          setIsLoading(false);
          return;
        }

        await createOffice(
          {
            user_id: user.id,
            enterprise_id: enterprise.id,
            name: data.name.trim(),
            code: data.code?.trim() || undefined,
            short_address: data.short_address?.trim() || undefined,
            building_number: data.building_number?.trim() || undefined,
            street_name: data.street_name?.trim() || undefined,
            city: data.city?.trim() || undefined,
            region: data.region?.trim() || undefined,
            country: data.country?.trim() || undefined,
            zip_code: data.zip_code?.trim() || undefined,
            area: data.area || undefined,
            status: data.status,
            notes: data.notes,
          },
          {
            onSuccess: async (response) => {
              if (onSuccess) onSuccess();
            },
          },
        );
      }
    } catch (error) {
      console.error("Error in office form:", error);
      toast.error(t("General.error_operation"), {
        description: t("Offices.error.create"),
      });
      setIsLoading(false);
    }
  };

  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));
  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).officeForm = form;
  }

  return (
    <div>
      <Form {...form}>
        <form
          id={formHtmlId || "office-form"}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(handleSubmit)(e);
          }}
        >
          <input hidden type="text" value={user?.id} {...form.register("user_id")} />
          <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />
          <div className="form-container">
            <div className="form-fields-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Offices.form.name.label")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        placeholder={t("Offices.form.name.placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Offices.form.code.label")}</FormLabel>
                    <FormControl>
                      <CodeInput
                        onSerial={() => {
                          const nextNumber = (offices?.length || 0) + 1;
                          const paddedNumber = String(nextNumber).padStart(4, "0");
                          form.setValue("code", `OF-${paddedNumber}`);
                        }}
                        onRandom={() => {
                          const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                          let randomCode = "";
                          for (let i = 0; i < 5; i++) {
                            randomCode += randomChars.charAt(
                              Math.floor(Math.random() * randomChars.length),
                            );
                          }
                          form.setValue("code", `OF-${randomCode}`);
                        }}
                        inputProps={{
                          disabled: isLoading,
                          placeholder: t("Offices.form.code.placeholder"),
                          ...field,
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Offices.form.email.label")}</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        {...field}
                        type="email"
                        disabled={isLoading}
                        placeholder={t("Offices.form.email.placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Offices.form.phone.label")}</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <EmployeeCombobox
                formName="manager"
                label={t("Offices.form.manager.label")}
                control={form.control}
                employees={employees || []}
                loadingCombobox={isFetchingEmployees}
                isSaving={isEmployeeSaving}
                isDialogOpen={isEmployeeFormDialogOpen}
                setIsDialogOpen={setIsEmployeeFormDialogOpen}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("CommonStatus.label")}</FormLabel>
                    <FormControl>
                      <BooleanTabs
                        disabled={isLoading}
                        trueText={t("CommonStatus.active")}
                        falseText={t("CommonStatus.inactive")}
                        value={field.value === "active"}
                        onValueChange={(newValue) => {
                          field.onChange(newValue ? "active" : "inactive");
                        }}
                        listClassName="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => {
                  const [unit, setUnit] = useState("sqm");
                  const initialNumber = (() => {
                    if (typeof field.value === "string") {
                      const match = field.value.match(/^(sqm|sqft)\s*(\d+(?:\.\d+)?)$/);
                      if (match) return match[2];
                    }
                    return "";
                  })();
                  const [areaValue, setAreaValue] = useState(initialNumber);
                  return (
                    <FormItem>
                      <FormLabel>{t("Offices.form.area.label")}</FormLabel>
                      <FormControl>
                        <UnitsInput
                          label={undefined}
                          inputProps={{
                            type: "number",
                            placeholder: t("Offices.form.area.placeholder"),
                            value: areaValue,
                            onChange: (e) => {
                              setAreaValue(e.target.value);
                            },
                            onBlur: () => {
                              if (areaValue === "") {
                                field.onChange(undefined);
                              } else {
                                field.onChange(unit + " " + areaValue);
                              }
                            },
                            disabled: isLoading,
                          }}
                          selectProps={{
                            options: [
                              { value: "sqm", label: "m²" },
                              { value: "sqft", label: "ft²" },
                            ],
                            value: unit,
                            onValueChange: (newUnit) => {
                              setUnit(newUnit);
                              if (areaValue !== "") {
                                field.onChange(newUnit + " " + areaValue);
                              }
                            },
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
          <AddressFormSection
            dir={locale === "ar" ? "rtl" : "ltr"}
            inDialog={editMode || nestedForm}
            title={t("Offices.form.address.label")}
            control={form.control}
            disabled={isLoading}
          />
          <DocumentsFormSection
            inDialog={editMode || nestedForm}
            control={form.control}
            title={t("Offices.form.documents.label")}
            entityType="office"
            entityId={defaultValues?.id}
            disabled={isLoading}
          />
          <NotesSection
            inDialog={editMode || nestedForm}
            control={form.control}
            title={t("Offices.form.notes.label")}
          />
        </form>
      </Form>
    </div>
  );
}
