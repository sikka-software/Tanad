import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
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
import { CurrencyInput } from "@/ui/currency-input";
import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import { createClient } from "@/utils/supabase/component";

import { Button } from "@/components/ui/button";
import PhoneInput from "@/components/ui/phone-input";

import DepartmentForm from "@/department/department.form";
import { useDepartments } from "@/department/department.hooks";
import useDepartmentStore from "@/department/department.store";

import { useCreateEmployee, useUpdateEmployee } from "@/employee/employee.hooks";
import useEmployeeStore from "@/employee/employee.store";
import type {
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

const createEmployeeFormSchema = (t: (key: string) => string) => {
  const supabase = createClient();

  return z.object({
    first_name: z.string().min(1, t("Employees.form.first_name.required")),
    last_name: z.string().min(1, t("Employees.form.last_name.required")),
    email: z
      .string()
      .email(t("Employees.form.email.invalid"))
      .refine(async (email) => {
        const { user } = useUserStore.getState();
        if (!user?.id) return true;
        const query = supabase
          .from("employees")
          .select("id")
          .eq("email", email)
          .eq("user_id", user.id);
        const { data } = await query.maybeSingle();
        return !data;
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
export type EmployeeFormValues = z.input<ReturnType<typeof createEmployeeFormSchema>>;

interface EmployeeFormProps {
  id?: string;
  onSuccess?: () => void;
  defaultValues?: Omit<Partial<EmployeeFormValues>, "salary"> & {
    salary?: SalaryComponent[] | null;
  };
  editMode?: boolean;
}

export function EmployeeForm({ id, onSuccess, defaultValues, editMode }: EmployeeFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { mutate: createEmployee } = useCreateEmployee();
  const { mutate: updateEmployee } = useUpdateEmployee();

  const isDepartmentSaving = useDepartmentStore((state) => state.isLoading);
  const setIsDepartmentSaving = useDepartmentStore((state) => state.setIsLoading);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const { data: departments, isLoading: departmentsLoading } = useDepartments();

  const setLoadingSave = useEmployeeStore((state) => state.setIsLoading);
  const loadingSave = useEmployeeStore((state) => state.isLoading);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(createEmployeeFormSchema(t)),
    defaultValues: {
      first_name: defaultValues?.first_name || "",
      last_name: defaultValues?.last_name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone ?? undefined,
      position: defaultValues?.position || "",
      department: defaultValues?.department || null,
      hire_date: defaultValues?.hire_date || undefined,
      salary: defaultValues?.salary ?? [],
      status: defaultValues?.status || "active",
      notes: defaultValues?.notes ?? undefined,
    },
  });

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

  const handleSubmit = async (data: EmployeeFormValues) => {
    setLoadingSave(true);

    const submitData = {
      ...data,
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || undefined,
      position: data.position.trim(),
      hire_date: data.hire_date?.toISOString(),
      notes: data.notes?.trim() || undefined,
      department_id: data.department || undefined,
      salary: data.salary || [],
    };

    const { department, ...finalSubmitData } = submitData;

    try {
      if (editMode) {
        await updateEmployee({
          id: id!,
          updates: finalSubmitData as EmployeeUpdateData,
        });

        toast.success(t("General.successful_operation"), {
          description: t("Employees.success.updated"),
        });
        onSuccess?.();
      } else {
        await createEmployee(finalSubmitData as EmployeeCreateData);

        toast.success(t("General.successful_operation"), {
          description: t("Employees.success.created"),
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error(error);
      setLoadingSave(false);
      toast.error(t("General.error_operation"), {
        description: t("Employees.error.creating"),
      });
      throw error;
    }
  };

  if (typeof window !== "undefined") {
    (window as any).employeeForm = form;
  }

  return (
    <>
      <Form {...form}>
        <form id={id} onSubmit={form.handleSubmit(handleSubmit)}>
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
                        disabled={loadingSave}
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
                        disabled={loadingSave}
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
                        disabled={loadingSave}
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
                      <PhoneInput disabled={loadingSave} {...field} value={field.value ?? ""} />
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
                        disabled={loadingSave}
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
                        disabled={loadingSave}
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
                        date={field.value}
                        onSelect={field.onChange}
                        disabled={loadingSave}
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
                    disabled={loadingSave}
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
                      {/* <SelectItem value="terminated">{t("Employees.form.status.terminated")}</SelectItem> */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 rounded-md border p-4 md:col-span-2">
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
                        <FormControl>
                          <Input
                            placeholder={t("Employees.form.salary.type_placeholder")}
                            disabled={loadingSave}
                            {...typeField}
                          />
                        </FormControl>
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
                            disabled={loadingSave}
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
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={loadingSave}
                    aria-label={t("General.remove")}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ type: "", amount: 0 })}
                disabled={loadingSave}
              >
                {t("Employees.form.salary.add_component")}
              </Button>
              <div className="mt-4 text-right font-medium">
                {t("Employees.form.salary.total")}:{" "}
                {new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(
                  totalSalary,
                )}
              </div>
            </div>

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
                      disabled={loadingSave}
                      {...field}
                      value={field.value ?? ""}
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
            setIsDepartmentSaving(false);
          }}
        />
      </FormDialog>
    </>
  );
}
