import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
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

import DepartmentForm, { DepartmentFormValues } from "@/components/app/department/department.form";

import { supabase } from "@/lib/supabase";

import { useDepartments, DEPARTMENTS_QUERY_KEY } from "@/hooks/useDepartments";
import { useEmployeesStore } from "@/stores/employees.store";
import useUserStore from "@/stores/use-user-store";

interface EmployeeFormProps {
  id?: string;
  onSuccess?: () => void;
  onSubmit: (data: EmployeeFormValues) => Promise<void>;
}

const createEmployeeFormSchema = (t: (key: string) => string) =>
  z.object({
    first_name: z.string().min(1, t("Employees.form.first_name.required")),
    last_name: z.string().min(1, t("Employees.form.last_name.required")),
    email: z
      .string()
      .email(t("Employees.form.email.invalid"))
      .refine(async (email) => {
        const { data, error } = await supabase
          .from("employees")
          .select("id")
          .eq("email", email)
          .single();
        return !data;
      }, t("Employees.form.email.duplicate")),
    phone: z.string().optional(),
    position: z.string().min(1, t("Employees.form.position.required")),
    department: z.string().nullable(),
    hireDate: z.date({
      required_error: t("Employees.form.hire_date.required"),
    }),
    salary: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        t("Employees.form.salary.invalid"),
      ),
    status: z.enum(["active", "inactive", "on_leave"]),
    notes: z.string().optional(),
  });

export type EmployeeFormValues = z.infer<ReturnType<typeof createEmployeeFormSchema>>;

export function EmployeeForm({ id, onSuccess, onSubmit }: EmployeeFormProps) {
  const t = useTranslations();
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isDepartmentSaving, setIsDepartmentSaving] = useState(false);
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const { user } = useUserStore();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { setLoadingSave, loadingSave } = useEmployeesStore();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(createEmployeeFormSchema(t)),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      position: "",
      department: null,
      hireDate: undefined,
      salary: "",
      status: "active",
      notes: "",
    },
  });

  // Format departments for ComboboxAdd
  const departmentOptions =
    departments?.map((department) => ({
      label: department.name,
      value: department.id,
    })) || [];

  const handleDepartmentSubmit = async (data: DepartmentFormValues) => {
    setIsDepartmentSaving(true);
    try {
      // Check if user ID is available
      if (!user?.id) {
        throw new Error(t("error.not_authenticated"));
      }

      const { data: newDepartment, error } = await supabase
        .from("departments")
        .insert([
          {
            name: data.name.trim(),
            description: data.description?.trim() || null,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Then create the department locations
      if (data.locations && data.locations.length > 0) {
        const locationInserts = data.locations.map((locationId) => ({
          department_id: newDepartment.id,
          location_id: locationId,
          location_type: "office", // Default to office type
        }));

        const { error: locationError } = await supabase
          .from("department_locations")
          .insert(locationInserts);

        if (locationError) throw locationError;

        // Update the department object with locations
        newDepartment.locations = data.locations;
      }

      // Update the departments cache
      const previousDepartments = queryClient.getQueryData(DEPARTMENTS_QUERY_KEY) || [];
      queryClient.setQueryData(DEPARTMENTS_QUERY_KEY, [
        ...(Array.isArray(previousDepartments) ? previousDepartments : []),
        newDepartment,
      ]);

      // Also set the individual department query data
      queryClient.setQueryData([...DEPARTMENTS_QUERY_KEY, newDepartment.id], newDepartment);

      // Set the new department as the selected department
      form.setValue("department", newDepartment.id);

      // Close the dialog
      setIsDepartmentDialogOpen(false);

      // Show success message
      toast.success(t("General.successful_operation"), {
        description: t("Departments.success.created"),
      });
    } catch (error) {
      console.error("Error creating department:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Departments.error.create"),
      });
    } finally {
      setIsDepartmentSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoadingSave(true);
      await form.handleSubmit(onSubmit)();
    } catch (error) {
      setLoadingSave(false);
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
      <Form {...form}>
        <form id={id} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Employees.form.first_name.label")} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t("Employees.form.first_name.placeholder")} {...field} />
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
                    <Input placeholder={t("Employees.form.last_name.placeholder")} {...field} />
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
                    <Input placeholder={t("Employees.form.position.placeholder")} {...field} />
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
              name="hireDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Employees.form.hire_date.label")} *</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onSelect={field.onChange}
                      placeholder={t("Employees.form.hire_date.placeholder")}
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
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={t("Employees.form.salary.placeholder")}
                      {...field}
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        <DepartmentForm id="department-form" onSubmit={handleDepartmentSubmit} />
      </FormDialog>
    </>
  );
}
