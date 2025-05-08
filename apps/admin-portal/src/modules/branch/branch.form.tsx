import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@root/src/components/blocks/editor-x/editor";
import FormSectionHeader from "@root/src/components/forms/form-section-header";
import { ComboboxAdd } from "@root/src/components/ui/combobox-add";
import { CommandSelect } from "@root/src/components/ui/command-select";
import { FormDialog } from "@root/src/components/ui/form-dialog";
import { SerializedEditorState } from "lexical";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import { AddressFormSection } from "@/components/forms/address-form-section";
import { createAddressSchema } from "@/components/forms/address-schema";
import CodeInput from "@/components/ui/code-input";
import PhoneInput from "@/components/ui/phone-input";

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { EmployeeForm } from "../employee/employee.form";
import { useEmployees } from "../employee/employee.hooks";
import useEmployeeStore from "../employee/employee.store";
import { useBranches, useCreateBranch, useUpdateBranch } from "./branch.hooks";
import useBranchStore from "./branch.store";
import { BranchUpdateData, BranchCreateData, Branch } from "./branch.type";

export const createBranchSchema = (t: (key: string) => string) => {
  const baseBranchSchema = z.object({
    name: z.string().min(1, t("Branches.form.name.required")),
    code: z.string().min(1, t("Branches.form.code.required")),
    phone: z.string().optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
    manager: z
      .string({ invalid_type_error: t("Branches.form.manager.invalid_uuid") })
      .uuid({ message: t("Branches.form.manager.invalid_uuid") })
      .optional()
      .nullable(),
    status: z.enum(["active", "inactive"], {
      message: t("Branches.form.status.required"),
    }),
    notes: z.any().optional().nullable(),
  });

  const addressSchema = createAddressSchema(t);

  return baseBranchSchema.merge(addressSchema);
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
}: ModuleFormProps<BranchUpdateData | BranchCreateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const { user, enterprise } = useUserStore();
  const { mutate: createBranch } = useCreateBranch();
  const { mutate: updateBranch } = useUpdateBranch();
  const { data: branches } = useBranches();

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const setIsEmployeeSaving = useEmployeeStore((state) => state.setIsLoading);
  const isEmployeeSaving = useEmployeeStore((state) => state.isLoading);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);

  const isLoading = useBranchStore((state) => state.isLoading);
  const setIsLoading = useBranchStore((state) => state.setIsLoading);

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
      status: (defaultValues?.status as "active" | "inactive") || "active",
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
    const optionalString = (val: string | null | undefined): string | null => {
      return val && val.trim() !== "" ? val.trim() : null;
    };

    // Prepare payload - ensure optional fields are null if empty and required fields are present
    const payload: BranchCreateData = {
      name: data.name.trim(),
      code: data.code?.trim() || null,
      phone: optionalString(data.phone) ?? null,
      email: optionalString(data.email) ?? null,
      manager: data.manager && data.manager.trim() !== "" ? data.manager : null,
      notes: data.notes ?? null,
      status: data.status,
      short_address: optionalString(data.short_address) ?? null,
      building_number: optionalString(data.building_number) ?? null,
      street_name: optionalString(data.street_name) ?? null,
      city: optionalString(data.city) ?? null,
      region: optionalString(data.region) ?? null,
      country: optionalString(data.country) ?? null,
      zip_code: optionalString(data.zip_code) ?? null,
      additional_number: optionalString((data as any).additional_number) ?? null,
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

  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  if (typeof window !== "undefined") {
    (window as any).branchForm = form;
  }

  return (
    <div>
      <Form {...form}>
        <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
          {/* <FormSectionHeader inDialog title={t("Branches.form.details.label")} /> */}
          <div className="form-container">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      >
                        <Input
                          placeholder={t("Branches.form.code.placeholder")}
                          {...field}
                          disabled={isLoading}
                        />
                      </CodeInput>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        ariaInvalid={form.formState.errors.phone !== undefined}
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
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Branches.form.manager.label")}</FormLabel>
                    <FormControl>
                      <ComboboxAdd
                        direction={locale === "ar" ? "rtl" : "ltr"}
                        data={employeeOptions}
                        isLoading={employeesLoading}
                        defaultValue={field.value || ""}
                        onChange={(value) => {
                          field.onChange(value || null);
                        }}
                        texts={{
                          placeholder: t("Branches.form.manager.placeholder"),
                          searchPlaceholder: t("Employees.search_employees"),
                          noItems: t("Branches.form.manager.no_employees"),
                        }}
                        addText={t("Employees.add_new")}
                        onAddClick={() => setIsEmployeeDialogOpen(true)}
                        ariaInvalid={!!form.formState.errors.manager}
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
                      <CommandSelect
                        direction={locale === "ar" ? "rtl" : "ltr"}
                        data={[
                          { label: t("Branches.form.status.active"), value: "active" },
                          { label: t("Branches.form.status.inactive"), value: "inactive" },
                        ]}
                        isLoading={false}
                        defaultValue={field.value || ""}
                        onChange={(value) => {
                          field.onChange(value || null);
                        }}
                        texts={{
                          placeholder: t("Branches.form.status.placeholder"),
                        }}
                        renderOption={(item) => {
                          return <div>{item.label}</div>;
                        }}
                        ariaInvalid={!!form.formState.errors.manager}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <AddressFormSection
            title={t("Branches.form.address.label")}
            control={form.control}
            isLoading={isLoading}
          />

          <FormSectionHeader title={t("Branches.form.notes.label")} />
          <div className="form-container bg-green-400">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Editor
                      editorSerializedState={field.value as unknown as SerializedEditorState}
                      onSerializedChange={(value) => field.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>

      <FormDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        title={t("Employees.add_new")}
        formId="employee-form"
        loadingSave={isEmployeeSaving}
      >
        <EmployeeForm
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
