import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ComboboxAdd } from "@/ui/combobox-add";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";

import { EmployeeForm, type EmployeeFormValues } from "@/components/app/employee/employee.form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

import { useEmployees } from "@/hooks/useEmployees";
import { useEmployeesStore } from "@/stores/employees.store";
import useUserStore from "@/stores/use-user-store";

const requestSchema = z.object({
  employee_id: z.string().uuid(),
  employeeName: z.string().min(1),
  type: z.enum(["leave", "expense", "document", "other"]),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  amount: z.number().optional(),
  attachments: z.array(z.any()).default([]),
  notes: z.string().optional(),
});

export type EmployeeRequestFormValues = z.input<typeof requestSchema>;

interface EmployeeRequestFormProps {
  id?: string;
  employee_id?: string;
  onSuccess?: () => void;
  onSubmit: (data: EmployeeRequestFormValues) => Promise<void>;
  loading?: boolean;
}

const EmployeeRequestForm = ({
  id,
  employee_id,
  onSuccess,
  onSubmit,
  loading = false,
}: EmployeeRequestFormProps) => {
  const t = useTranslations();
  const router = useRouter();
  const { locale } = useRouter();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { setLoadingSave: setIsEmployeeSaving, loadingSave: isEmployeeSaving } =
    useEmployeesStore();
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const form = useForm<EmployeeRequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      employee_id: employee_id || "",
      employeeName: "",
      type: "leave",
      status: "pending",
      title: "",
      attachments: [],
    },
  });

  // Format employees for ComboboxAdd
  const employeeOptions = employees.map((emp) => {
    return {
      label: `${emp.first_name} ${emp.last_name}`,
      value: emp.email,
    };
  });

  const handleEmployeeSubmit = async (data: EmployeeFormValues) => {
    setIsEmployeeSaving(true);
    try {
      if (!user?.id) {
        throw new Error(t("error.not_authenticated"));
      }

      const response = await fetch("/api/employees/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          email: data.email.trim(),
          phone: data.phone?.trim() || null,
          position: data.position.trim(),
          department_id: data.department || null,
          hireDate: data.hireDate,
          salary: data.salary ? parseFloat(data.salary) : null,
          status: data.status,
          notes: data.notes?.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("Employees.messages.error"));
      }

      // Get the new employee data
      const newEmployee = await response.json();

      // Update the employees cache to include the new employee
      const previousEmployees = queryClient.getQueryData(["employees"]) || [];
      queryClient.setQueryData(
        ["employees"],
        [...(Array.isArray(previousEmployees) ? previousEmployees : []), newEmployee],
      );

      // Set the new employee as the selected employee
      const fullName = `${newEmployee.first_name} ${newEmployee.last_name}`;
      form.setValue("employeeName", fullName);

      // Close the dialog
      setIsEmployeeDialogOpen(false);

      // Show success message
      toast.success(t("General.successful_operation"), {
        description: t("Employees.success.created"),
      });
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Employees.error.create"),
      });
    }
  };

  const handleSubmit = async (data: EmployeeRequestFormValues) => {
    try {
      await onSubmit(data);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const requestTypes = [
    { label: t("EmployeeRequests.form.type.leave"), value: "leave" },
    { label: t("EmployeeRequests.form.type.expense"), value: "expense" },
    { label: t("EmployeeRequests.form.type.document"), value: "document" },
    { label: t("EmployeeRequests.form.type.other"), value: "other" },
  ] as const;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <input type="hidden" {...form.register("employee_id")} />
          <FormField
            control={form.control}
            name="employeeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("EmployeeRequests.form.employee.label")} *</FormLabel>
                <FormControl>
                  <ComboboxAdd
                    direction={locale === "ar" ? "rtl" : "ltr"}
                    data={employeeOptions}
                    isLoading={employeesLoading}
                    defaultValue={field.value}
                    onChange={field.onChange}
                    renderOption={(item) => {
                      return (
                        <div className="flex flex-col">
                          <span>{item.label}</span>
                          <span className="text-sm text-muted-foreground">{item.value}</span>
                        </div>
                      );
                    }}
                    texts={{
                      placeholder: t("EmployeeRequests.form.employee.placeholder"),
                      searchPlaceholder: t("Employees.search_employees"),
                      noItems: t("EmployeeRequests.form.employee.no_employees"),
                    }}
                    addText={t("Employees.add_new")}
                    onAddClick={() => setIsEmployeeDialogOpen(true)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <div className="space-y-2">
                <label>{t("EmployeeRequests.form.type.label")}</label>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("EmployeeRequests.form.type.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <div className="space-y-2">
                <label>{t("EmployeeRequests.form.title.label")}</label>
                <Input {...field} placeholder={t("EmployeeRequests.form.title.placeholder")} />
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <div className="space-y-2">
                <label>{t("EmployeeRequests.form.description.label")}</label>
                <Textarea
                  {...field}
                  placeholder={t("EmployeeRequests.form.description.placeholder")}
                />
              </div>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <div className="space-y-2">
                  <label>{t("EmployeeRequests.form.date_range.start")}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : t("General.pick_date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <div className="space-y-2">
                  <label>{t("EmployeeRequests.form.date_range.end")}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : t("General.pick_date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <div className="space-y-2">
                <label>{t("EmployeeRequests.form.amount.label")}</label>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  placeholder={t("EmployeeRequests.form.amount.placeholder")}
                />
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <div className="space-y-2">
                <label>{t("EmployeeRequests.form.notes.label")}</label>
                <Textarea {...field} placeholder={t("EmployeeRequests.form.notes.placeholder")} />
              </div>
            )}
          />
        </form>
      </Form>

      <FormDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        title={t("Employees.add_new")}
        formId="employee-form"
        loadingSave={isEmployeeSaving}
      >
        <EmployeeForm id="employee-form" onSubmit={handleEmployeeSubmit} />
      </FormDialog>
    </>
  );
};

export default EmployeeRequestForm;
