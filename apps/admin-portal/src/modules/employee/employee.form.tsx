import { zodResolver } from "@hookform/resolvers/zod";
import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { PlusCircle, Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  useForm,
  useFieldArray,
  type SubmitHandler,
  type Control,
  type FieldValues,
} from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { ComboboxAdd } from "@/ui/combobox-add";
import { CurrencyInput, MoneyFormatter } from "@/ui/currency-input";
import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import { createClient } from "@/utils/supabase/component";

import { Button } from "@/components/ui/button";
import PhoneInput from "@/components/ui/phone-input";

import { ModuleFormProps } from "@/types/common.type";

import DepartmentForm from "@/department/department.form";
import { useDepartments } from "@/department/department.hooks";
import useDepartmentStore from "@/department/department.store";

import { useCreateEmployee } from "@/employee/employee.hooks";
import { SALARY_COMPONENT_TYPES } from "@/employee/employee.options";
import useEmployeeStore from "@/employee/employee.store";
import type {
  Employee,
  EmployeeCreateData,
  EmployeeUpdateData,
  SalaryComponent,
} from "@/employee/employee.types";

import useUserStore from "@/stores/use-user-store";

const salaryComponentSchema = z.object({
  type: z.string().min(1, "Type is required"),
  amount: z.coerce
    .number({
      invalid_type_error: "Amount must be a number",
    })
    .min(0, "Amount must be non-negative")
    .default(0),
});

interface EmployeeFormExtendedProps extends ModuleFormProps<Employee> {
  updateEmployee: UseMutateAsyncFunction<
    Employee,
    Error,
    { id: string; updates: EmployeeUpdateData },
    unknown
  >;
  createEmployee: UseMutateAsyncFunction<Employee, Error, EmployeeCreateData, unknown>;
  isSubmitting: boolean;
}

export function EmployeeForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
  updateEmployee,
  createEmployee,
  isSubmitting,
}: EmployeeFormExtendedProps) {
  const t = useTranslations();
  const locale = useLocale();

  const isDepartmentSaving = useDepartmentStore((state) => state.isLoading);
  const setIsDepartmentSaving = useDepartmentStore((state) => state.setIsLoading);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const { data: departments, isLoading: departmentsLoading } = useDepartments();

  const isEmployeeSaving = useEmployeeStore((state) => state.isLoading);
  const setIsEmployeeSaving = useEmployeeStore((state) => state.setIsLoading);

  const setIsFormDialogOpen = useEmployeeStore((state) => state.setIsFormDialogOpen);

  const actualEmployeeId = editMode ? defaultValues?.id : undefined;
  const initialEmail = editMode ? defaultValues?.email : undefined;

  const mapDataToFormDefaults = (data: Employee | null | undefined) => ({
    first_name: data?.first_name || "",
    last_name: data?.last_name || "",
    email: data?.email || "",
    phone: data?.phone ?? "",
    position: data?.position || "",
    department: data?.department_id || null,
    hire_date: data?.hire_date ? new Date(data.hire_date) : undefined,
    salary: data?.salary || [],
    status: data?.status || "active",
    notes: data?.notes ?? "",
  });

  const createEmployeeFormSchema = () => {
    const supabase = createClient();

    return z.object({
      first_name: z.string().min(1, t("Employees.form.first_name.required")),
      last_name: z.string().min(1, t("Employees.form.last_name.required")),
      email: z
        .string()
        .email(t("Employees.form.email.invalid"))
        .refine(async (email) => {
          if (actualEmployeeId && email === initialEmail) {
            return true;
          }
          setIsEmployeeSaving(true);

          const { user } = useUserStore.getState();
          if (!user?.id) return true;
          const query = supabase
            .from("employees")
            .select("id", { count: "exact" })
            .eq("email", email)
            .eq("user_id", user.id);

          if (actualEmployeeId) {
            query.neq("id", actualEmployeeId);
          }

          const { error, count } = await query;

          if (error) {
            console.error("Email validation error:", error);
            return false;
          }

          setIsEmployeeSaving(false);
          return count === 0;
        }, t("Employees.form.email.duplicate")),
      phone: z.string().optional(),
      position: z.string().min(1, t("Employees.form.position.required")),
      department: z.string().nullable(),
      hire_date: z.date({
        required_error: t("Employees.form.hire_date.required"),
      }),
      salary: z.array(salaryComponentSchema).optional(),
      status: z.enum(["active", "inactive", "on_leave", "terminated"]),
      notes: z.string().optional(),
    });
  };

  const form = useForm<z.input<ReturnType<typeof createEmployeeFormSchema>>>({
    resolver: zodResolver(createEmployeeFormSchema()),
    defaultValues: mapDataToFormDefaults(defaultValues),
  });

  useEffect(() => {
    if (defaultValues) {
      console.log("Resetting form with defaultValues:", defaultValues);
      form.reset(mapDataToFormDefaults(defaultValues));
    } else {
      // Optionally reset to empty if defaultValues becomes null (e.g., switching modes)
      // form.reset(mapDataToFormDefaults(null));
    }
  }, [defaultValues, form.reset]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "salary",
  });

  const salaryComponents = form.watch("salary");
  const totalSalary =
    salaryComponents?.reduce((sum, comp) => sum + (Number(comp.amount) || 0), 0) || 0;

  const departmentOptions =
    departments?.map((department) => ({
      label: department.name,
      value: department.id,
    })) || [];

  const handleSubmit = async (data: z.input<ReturnType<typeof createEmployeeFormSchema>>) => {
    setIsEmployeeSaving(true);
    // Log dirtyFields for debugging
    console.log("Form dirtyFields:", form.formState.dirtyFields);
    console.log("Form isDirty:", form.formState.isDirty);

    // Explicitly check if any field has been marked as dirty
    const isActuallyDirty = Object.keys(form.formState.dirtyFields).length > 0;
    console.log("Is Actually Dirty (based on dirtyFields object):", isActuallyDirty);

    // Check if editing and if the form is actually dirty based on the dirtyFields object
    if (editMode && !isActuallyDirty) {
      console.log("Form not dirty (based on dirtyFields), closing without saving.");
      // If nothing changed, just close the form without an API call or toast
      onSuccess?.();
      return;
    }

    const submitData = {
      ...data,
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || undefined,
      position: data.position.trim(),
      hire_date: data.hire_date,
      notes: data.notes?.trim() || undefined,
      department_id: data.department || undefined,
      salary: (data.salary || []).map((comp) => ({
        ...comp,
        amount: Number(comp.amount) || 0,
      })),
    };

    const { department, ...finalSubmitData } = submitData;

    try {
      if (editMode) {
        await updateEmployee({
          id: actualEmployeeId!,
          updates: { ...finalSubmitData } as EmployeeUpdateData,
        });
        // Show success toast for update
        // toast.success(t("General.success_operation"), {
        //   description: t("Employees.success.updating"),
        // });
        onSuccess?.();
      } else {
        await createEmployee(finalSubmitData as EmployeeCreateData);
        // Show success toast for create
        // toast.success(t("General.success_operation"), {
        //   description: t("Employees.success.creating"),
        // });
        onSuccess?.();
      }
    } catch (error) {
      console.error("Employee form error:", error);
      const errorDescription = editMode ? t("Employees.error.update") : t("Employees.error.create");
      toast.error(t("General.error_operation"), {
        description: errorDescription,
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).employeeForm = form;
  }

  return (
    <>
      <Form {...form}>
        <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="form-container">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.first_name.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Employees.form.first_name.placeholder")}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.last_name.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Employees.form.last_name.placeholder")}
                        disabled={isSubmitting}
                        {...field}
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
                    <FormLabel>{t("Employees.form.email.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Employees.form.email.placeholder")}
                        disabled={isSubmitting}
                        type="email"
                        {...field}
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
                    <FormLabel>{t("Employees.form.phone.label")}</FormLabel>
                    <FormControl>
                      <PhoneInput disabled={isSubmitting} {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.position.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Employees.form.position.placeholder")}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.department.label")}</FormLabel>
                    <FormControl>
                      <ComboboxAdd
                        data={departmentOptions}
                        defaultValue={field.value ?? undefined}
                        onChange={field.onChange}
                        isLoading={departmentsLoading}
                        disabled={isSubmitting}
                        texts={{
                          placeholder: t("Employees.form.department.placeholder"),
                          searchPlaceholder: t("Employees.form.department.searchPlaceholder"),
                          noItems: t("Employees.form.department.no_departments"),
                        }}
                        addText={t("Departments.add_new")}
                        onAddClick={() => setIsDepartmentDialogOpen(true)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("Employees.form.hire_date.label")} *</FormLabel>
                    <FormControl>
                      <DatePicker
                        placeholder={t("Employees.form.hire_date.placeholder")}
                        date={field.value}
                        onSelect={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Employees.form.status.label")} *</FormLabel>
                  <Select
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Employees.form.status.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{t("Employees.form.status.active")}</SelectItem>
                      <SelectItem value="inactive">
                        {t("Employees.form.status.inactive")}
                      </SelectItem>
                      <SelectItem value="on_leave">
                        {t("Employees.form.status.on_leave")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Employees.form.notes.label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("Employees.form.notes.placeholder")}
                      className="min-h-[100px]"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-muted sticky top-12 z-10 flex !min-h-12 items-center justify-between gap-4 border-y border-b px-2">
            <h2 className="ms-2 text-xl font-bold">{t("Employees.salary_section_title")}</h2>
            <Button
              type="button"
              size="sm"
              onClick={() => append({ type: "", amount: 0 })}
              disabled={isSubmitting}
            >
              <PlusCircle className="mr-2 size-4" />
              {t("Employees.form.salary.add_component")}
            </Button>
          </div>

          <div className="form-container">
            <FormLabel>{t("Employees.form.salary.label")}</FormLabel>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <FormField
                  control={form.control}
                  name={`salary.${index}.type`}
                  render={({ field: typeField }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">
                        {t("Employees.form.salary.type_label")}
                      </FormLabel>
                      <Select
                        dir={locale === "ar" ? "rtl" : "ltr"}
                        onValueChange={typeField.onChange}
                        defaultValue={typeField.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("Employees.form.salary.type_placeholder")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SALARY_COMPONENT_TYPES.map((typeOpt) => (
                            <SelectItem key={typeOpt.value} value={typeOpt.value}>
                              {t(`Employees.salary_types.${typeOpt.value}`, {
                                defaultValue: typeOpt.label,
                              })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`salary.${index}.amount`}
                  render={({ field: amountField }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">
                        {t("Employees.form.salary.amount_label")}
                      </FormLabel>
                      <FormControl>
                        <CurrencyInput
                          placeholder={t("Employees.form.salary.amount_placeholder")}
                          disabled={isSubmitting}
                          {...amountField}
                          showCommas={true}
                          value={
                            amountField.value ? parseFloat(String(amountField.value)) : undefined
                          }
                          onChange={(value) => amountField.onChange(value?.toString() || "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-9"
                  onClick={() => remove(index)}
                  disabled={isSubmitting}
                  aria-label={t("General.remove")}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="mt-4 text-end font-medium">
              {t("Employees.form.salary.total")}: {MoneyFormatter(totalSalary)}
            </div>
          </div>
        </form>
      </Form>

      <FormDialog
        open={isDepartmentDialogOpen}
        onOpenChange={setIsDepartmentDialogOpen}
        title={t("Departments.add_new")}
        formId="department-form"
        cancelText={t("General.cancel")}
        submitText={t("General.save")}
        loadingSave={isDepartmentSaving}
      >
        <DepartmentForm
          id="department-form"
          onSuccess={() => {
            setIsDepartmentDialogOpen(false);
          }}
        />
      </FormDialog>
    </>
  );
}
