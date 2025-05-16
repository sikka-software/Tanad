import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";

import NotesSection from "@/components/forms/notes-section";
import BooleanTabs from "@/components/ui/boolean-tabs";
import { ComboboxAdd } from "@/components/ui/comboboxes/combobox-add";
import { CommandSelect } from "@/components/ui/command-select";
import FormDialog from "@/components/ui/form-dialog";
import CodeInput from "@/components/ui/inputs/code-input";
import { Input } from "@/components/ui/inputs/input";
import PhoneInput from "@/components/ui/inputs/phone-input";
import UnitsInput from "@/components/ui/inputs/units-input";

import { AddressFormSection } from "@/forms/address-form-section";

import { addressSchema, createAddressSchema } from "@/lib/schemas/address.schema";

import { CommonStatus, ModuleFormProps } from "@/types/common.type";

import { useBranches, useCreateBranch, useUpdateBranch } from "@/branch/branch.hooks";
import useBranchStore from "@/branch/branch.store";
import { BranchUpdateData, BranchCreateData } from "@/branch/branch.type";

import { EmployeeForm } from "@/employee/employee.form";
import { useEmployees } from "@/employee/employee.hooks";
import useEmployeeStore from "@/employee/employee.store";

import { branches } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

const createBranchSchema = (t: (key: string) => string) => {
  const BranchSelectSchema = createInsertSchema(branches, {
    name: z.string().min(1, t("Branches.form.name.required")),
    code: z.string().min(1, t("Branches.form.code.required")),
    phone: z.string().optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
    manager: z
      .string({ invalid_type_error: t("Branches.form.manager.invalid_uuid") })
      .uuid({ message: t("Branches.form.manager.invalid_uuid") })
      .optional()
      .nullable(),
    status: z.enum(CommonStatus, {
      invalid_type_error: t("Branches.form.status.required"),
    }),

    area: z.string().optional().nullable(),
    notes: z.any().optional().nullable(),
    ...addressSchema,
  });
  return BranchSelectSchema;
};

export type BranchFormValues = z.input<ReturnType<typeof createBranchSchema>>;

export interface BranchFormProps {
  id?: string;
  onSuccess?: () => void;
  defaultValues?: BranchUpdateData | null;
  editMode?: boolean;
}

export function BranchForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
  nestedForm,
}: ModuleFormProps<BranchUpdateData | BranchCreateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);
  const { mutate: createBranch } = useCreateBranch();
  const { mutate: updateBranch } = useUpdateBranch();
  const { data: branches } = useBranches();

  const isLoading = useBranchStore((state) => state.isLoading);
  const setIsLoading = useBranchStore((state) => state.setIsLoading);

  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const setIsEmployeeSaving = useEmployeeStore((state) => state.setIsLoading);
  const isEmployeeSaving = useEmployeeStore((state) => state.isLoading);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(createBranchSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      code: defaultValues?.code || "",
      short_address: defaultValues?.short_address || "",
      building_number: defaultValues?.building_number || "",
      street_name: defaultValues?.street_name || "",
      city: defaultValues?.city || "",
      region: defaultValues?.region || "",
      country: defaultValues?.country || "",
      zip_code: defaultValues?.zip_code || "",
      phone: defaultValues?.phone || "",
      email: defaultValues?.email || "",
      manager: defaultValues?.manager || null,
      status: defaultValues?.status || "active",
      notes:
        defaultValues?.notes &&
        typeof defaultValues.notes === "object" &&
        "root" in defaultValues.notes
          ? defaultValues.notes
          : null,
    },
  });

  const handleSubmit = async (data: BranchFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      setIsLoading(false);
      return;
    }
    if (!enterprise?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.no_enterprise_selected"),
      });
      setIsLoading(false);
      return;
    }

    // Helper to convert empty string/null to null

    // Prepare payload - ensure optional fields are null if empty and required fields are present
    const payload: BranchCreateData = {
      name: data.name.trim(),
      code: data.code?.trim() || null,
      phone: data.phone,
      email: data.email,
      manager: data.manager && data.manager.trim() !== "" ? data.manager : null,
      notes: data.notes ?? null,
      status: data.status,
      short_address: data.short_address,
      building_number: data.building_number,
      street_name: data.street_name,
      city: data.city,
      region: data.region,
      country: data.country,
      zip_code: data.zip_code,
      additional_number: data.additional_number,
      user_id: user.id,
      enterprise_id: enterprise.id,
    };

    try {
      if (editMode) {
        if (!defaultValues?.id) {
          throw new Error("Branch ID is missing for update.");
        }
        await updateBranch(
          {
            id: defaultValues.id,
            data: payload as BranchUpdateData, // Use filtered payload
          },
          {
            onSuccess: () => {
              setIsLoading(false);
              if (onSuccess) onSuccess();
            },
            onError: () => setIsLoading(false),
          },
        );
      } else {
        await createBranch(payload, {
          onSuccess: () => {
            setIsLoading(false);
            if (onSuccess) onSuccess();
          },
          onError: () => setIsLoading(false),
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save branch:", error);
      toast.error(t("General.error_operation"), {
        description: t("Branches.error.create"),
      });
    }
  };

  const employeeOptions =
    employees?.map((emp) => ({
      label: `${emp.first_name} ${emp.last_name}`,
      value: emp.id,
    })) || [];

  if (typeof window !== "undefined") {
    (window as any).branchForm = form;
  }

  return (
    <div>
      <Form {...form}>
        <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
          <input hidden type="text" value={user?.id} {...form.register("user_id")} />
          <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />
          <div className="form-container">
            <div className="form-fields-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Branches.form.name.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Branches.form.name.placeholder")}
                        {...field}
                        disabled={isLoading}
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
                    <FormLabel>{t("Branches.form.code.label")} *</FormLabel>
                    <FormControl>
                      <CodeInput
                        onSerial={() => {
                          const nextNumber = (branches?.length || 0) + 1;
                          const paddedNumber = String(nextNumber).padStart(4, "0");
                          form.setValue("code", `BR-${paddedNumber}`);
                        }}
                        onRandom={() => {
                          const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                          let randomCode = "";
                          for (let i = 0; i < 5; i++) {
                            randomCode += randomChars.charAt(
                              Math.floor(Math.random() * randomChars.length),
                            );
                          }
                          form.setValue("code", `BR-${randomCode}`);
                        }}
                        inputProps={{
                          placeholder: t("Branches.form.code.placeholder"),
                          disabled: isLoading,
                        }}
                      ></CodeInput>
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
                    <FormLabel>{t("Branches.form.phone.label")}</FormLabel>
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
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Branches.form.email.label")}</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        type="email"
                        placeholder={t("Branches.form.email.placeholder")}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Branches.form.manager.label")}</FormLabel>
                    <FormControl>
                      <ComboboxAdd
                        dir={locale === "ar" ? "rtl" : "ltr"}
                        data={employeeOptions}
                        isLoading={employeesLoading}
                        defaultValue={field.value || ""}
                        onChange={(value) => {
                          field.onChange(value || null);
                        }}
                        texts={{
                          placeholder: t("Branches.form.manager.placeholder"),
                          searchPlaceholder: t("Pages.Employees.search"),
                          noItems: t("Pages.Employees.no_employees_found"),
                        }}
                        addText={t("Pages.Employees.add")}
                        onAddClick={() => setIsEmployeeDialogOpen(true)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Branches.form.status.label")}</FormLabel>
                    <FormControl>
                      <BooleanTabs
                        trueText={t("Branches.form.status.active")}
                        falseText={t("Branches.form.status.inactive")}
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
                      <FormLabel>{t("Branches.form.area.label")}</FormLabel>
                      <FormControl>
                        <UnitsInput
                          label={undefined}
                          inputProps={{
                            type: "number",
                            placeholder: t("Branches.form.area.placeholder"),
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
            title={t("Branches.form.address.label")}
            control={form.control}
            isLoading={isLoading}
          />
          <NotesSection
            inDialog={editMode || nestedForm}
            control={form.control}
            title={t("Branches.form.notes.label")}
          />
        </form>
      </Form>

      <FormDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        title={t("Pages.Employees.add")}
        formId="employee-form"
        loadingSave={isEmployeeSaving}
      >
        <EmployeeForm
          nestedForm
          formHtmlId="employee-form"
          onSuccess={() => {
            setIsEmployeeSaving(false);
            setIsEmployeeDialogOpen(false);
          }}
        />
      </FormDialog>
    </div>
  );
}
