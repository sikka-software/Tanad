import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useLocale, useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import { ComboboxAdd } from "@/components/ui/combobox-add";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import useUserStore from "@/hooks/use-user-store";
import { useDepartments } from "@/hooks/useDepartments";
import { supabase } from "@/lib/supabase";

import { FormDialog } from "../ui/form-dialog";
import DepartmentForm, { DepartmentFormValues } from "./department-form";

interface EmployeeFormProps {
  id?: string;
  onSuccess?: () => void;
  onSubmit: (data: EmployeeFormValues) => Promise<void>;
  loading?: boolean;
}

const createEmployeeFormSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z.string().min(1, t("Employees.form.first_name.required")),
    lastName: z.string().min(1, t("Employees.form.last_name.required")),
    email: z.string().email(t("Employees.form.email.invalid")),
    phone: z.string().optional(),
    position: z.string().min(1, t("Employees.form.position.required")),
    department: z.string().nullable(),
    hireDate: z.date({
      required_error: "Hire date is required",
    }),
    salary: z
      .string()
      .optional()
      .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), "Invalid salary"),
    isActive: z.boolean(),
    notes: z.string().optional(),
  });

export type EmployeeFormValues = z.infer<ReturnType<typeof createEmployeeFormSchema>>;

export function EmployeeForm({ id, onSuccess, onSubmit, loading = false }: EmployeeFormProps) {
  const t = useTranslations();
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const { user } = useUserStore();
  const locale = useLocale();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(createEmployeeFormSchema(t)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      department: null,
      hireDate: undefined,
      salary: "",
      isActive: true,
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
      }

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
    }
  };

  return (
    <>
      <Form {...form}>
        <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
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
              name="lastName"
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
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{t("Employees.form.is_active.label")}</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
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
      >
        <DepartmentForm id="department-form" onSubmit={handleDepartmentSubmit} />
      </FormDialog>
    </>
  );
}
