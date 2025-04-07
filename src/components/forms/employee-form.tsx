import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

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

interface EmployeeFormProps {
  id?: string;
  onSuccess?: () => void;
  onSubmit?: (data: EmployeeFormValues) => Promise<void>;
  loading?: boolean;
}

const employeeFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  department: z.string().optional(),
  hireDate: z.string().min(1, "Hire date is required"),
  salary: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), "Invalid salary"),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export function EmployeeForm({
  id,
  onSuccess,
  onSubmit: externalSubmit,
  loading = false,
}: EmployeeFormProps) {
  const router = useRouter();
  const t = useTranslations();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      hireDate: "",
      salary: "",
      isActive: true,
      notes: "",
    },
  });

  const onSubmit: SubmitHandler<EmployeeFormValues> = async (data) => {
    if (externalSubmit) {
      await externalSubmit(data);
      return;
    }

    try {
      const response = await fetch("/api/employees/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          phone: data.phone?.trim() || null,
          position: data.position.trim(),
          department: data.department?.trim() || null,
          hireDate: data.hireDate,
          salary: data.salary ? parseFloat(data.salary) : null,
          isActive: data.isActive,
          notes: data.notes?.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("Employees.messages.error"));
      }

      toast.success(t("Employees.messages.created"));

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/employees");
      }
    } catch (error) {
      toast.error(t("Employees.messages.error"), {
        description: error instanceof Error ? error.message : t("Employees.messages.error"),
      });
    }
  };

  return (
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
                  <Input placeholder={t("Employees.form.department.placeholder")} {...field} />
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
                  <Input type="date" {...field} />
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

        {/* <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/employees")}>
            {t("General.cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? t("Employees.messages.creating_employee")
              : t("Employees.messages.create_employee")}
          </Button>
        </div> */}
      </form>
    </Form>
  );
}
