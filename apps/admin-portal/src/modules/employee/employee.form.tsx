import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { ComboboxAdd } from "@/ui/combobox-add";
import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import { CurrencyInput } from "@/components/ui/currency-input";

import DepartmentForm from "@/modules/department/department.form";
import { useDepartments } from "@/modules/department/department.hooks";
import useEmployeeStore from "@/modules/employee/employee.store";
import useUserStore from "@/stores/use-user-store";
import { createClient } from "@/utils/supabase/component";

import useDepartmentStore from "../department/department.store";
import { useCreateEmployee, useUpdateEmployee } from "./employee.hooks";

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
        if (!user?.id) return true; // If no user, skip validation
        const { data, error } = await supabase
          .from("employees")
          .select("id")
          .eq("email", email)
          .eq("user_id", user.id)
          .single();
        return !data;
      }, t("Employees.form.email.duplicate")),
    phone: z.string().optional(),
    position: z.string().min(1, t("Employees.form.position.required")),
    department: z.string().nullable(),
    hire_date: z.date({
      required_error: t("Employees.form.hire_date.required"),
    }),
    salary: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        t("Employees.form.salary.invalid"),
      ),
    status: z.enum(["active", "inactive", "on_leave", "terminated"]),
    notes: z.string().optional(),
  });
};
export type EmployeeFormValues = z.infer<ReturnType<typeof createEmployeeFormSchema>>;

interface EmployeeFormProps {
  id?: string;
  onSuccess?: () => void;
  defaultValues?: EmployeeFormValues;
  editMode?: boolean;
}

export function EmployeeForm({ id, onSuccess, defaultValues, editMode }: EmployeeFormProps) {
  const t = useTranslations();
  const user = useUserStore((state) => state.user);
  const { mutate: createEmployee } = useCreateEmployee();
  const { mutate: updateEmployee } = useUpdateEmployee();

  const isDepartmentSaving = useDepartmentStore((state) => state.isLoading);
  const setIsDepartmentSaving = useDepartmentStore((state) => state.setIsLoading);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const locale = useLocale();
  const setLoadingSave = useEmployeeStore((state) => state.setIsLoading);
  const loadingSave = useEmployeeStore((state) => state.isLoading);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(createEmployeeFormSchema(t)),
    defaultValues: {
      first_name: defaultValues?.first_name || "",
      last_name: defaultValues?.last_name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      position: defaultValues?.position || "",
      department: defaultValues?.department || null,
      hire_date: defaultValues?.hire_date || undefined,
      salary: defaultValues?.salary || "",
      status: defaultValues?.status || "active",
      notes: defaultValues?.notes || "",
    },
  });

  // Format departments for ComboboxAdd
  const departmentOptions =
    departments?.map((department) => ({
      label: department.name,
      value: department.id,
    })) || [];

  const handleSubmit = async (data: EmployeeFormValues) => {
    setLoadingSave(true);

    try {
      if (editMode) {
        await updateEmployee({
          id: id!,
          updates: {
            first_name: data.first_name.trim(),
            last_name: data.last_name.trim(),
            email: data.email.trim(),
            phone: data.phone?.trim() || undefined,
            position: data.position.trim(),
            hire_date: data.hire_date?.toISOString(),
            salary: data.salary ? parseFloat(data.salary) : undefined,
            status: data.status,
            notes: data.notes?.trim() || undefined,
            department_id: data.department || undefined,
          },
        });

        toast.success(t("General.successful_operation"), {
          description: t("Employees.success.updated"),
        });
        onSuccess?.();
      } else {
        await createEmployee({
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          email: data.email.trim(),
          phone: data.phone?.trim() || undefined,
          position: data.position.trim(),
          hire_date: data.hire_date?.toISOString(),
          salary: data.salary ? parseFloat(data.salary) : undefined,
          status: data.status,
          notes: data.notes?.trim() || undefined,
          department_id: data.department || undefined,
        });

        toast.success(t("General.successful_operation"), {
          description: t("Employees.success.created"),
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error(error);
      setLoadingSave(false);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Employees.error.create"),
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
        <form
          id={id}
          onSubmit={async (e) => {
            e.preventDefault();
            setLoadingSave(true);
            const isValid = await form.trigger();
            if (!isValid) {
              setLoadingSave(false);
              return;
            }
            form.handleSubmit(handleSubmit)(e);
          }}
          className="space-y-4"
        >
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
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Employees.form.email.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("Employees.form.email.placeholder")}
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Employees.form.phone.label")}</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder={t("Employees.form.phone.placeholder")}
                      disabled={loadingSave}
                      {...field}
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
                      direction={locale === "ar" ? "rtl" : "ltr"}
                      data={departmentOptions}
                      isLoading={departmentsLoading}
                      defaultValue={field.value || ""}
                      onChange={(value) => field.onChange(value || null)}
                      texts={{
                        placeholder: t("Employees.form.department.placeholder"),
                        searchPlaceholder: t("Departments.search_departments"),
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
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="hire_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Employees.form.hire_date.label")} *</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onSelect={field.onChange}
                      placeholder={t("Employees.form.hire_date.placeholder")}
                      disabled={loadingSave}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Employees.form.salary.label")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      showCommas={true}
                      value={field.value ? parseFloat(field.value) : undefined}
                      onChange={(value) => field.onChange(value?.toString() || "")}
                      placeholder={t("Employees.form.salary.placeholder")}
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
                <FormLabel>{t("Employees.form.status.label")}</FormLabel>
                <Select
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
                    <SelectItem value="inactive">{t("Employees.form.status.inactive")}</SelectItem>
                    <SelectItem value="on_leave">{t("Employees.form.status.on_leave")}</SelectItem>
                    <SelectItem value="terminated">
                      {t("Employees.form.status.terminated")}
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
                    disabled={loadingSave}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
