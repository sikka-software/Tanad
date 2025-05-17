import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { format } from "date-fns";
import { createInsertSchema } from "drizzle-zod";
import { CalendarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import NotesSection from "@/components/forms/notes-section";
import { ComboboxAdd } from "@/components/ui/comboboxes/combobox-add";
import { DateInput } from "@/components/ui/inputs/date-input";
import { Input } from "@/components/ui/inputs/input";

import { cn, getNotesValue, validateYearRange } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import { EmployeeForm } from "@/employee/employee.form";
import { useEmployees } from "@/employee/employee.hooks";
import useEmployeeStore from "@/employee/employee.store";

import useEmployeeRequestsStore from "@/employee-request/employee-request.store";

import { employee_requests } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

import { InvoiceStatus } from "../invoice/invoice.type";
import { useCreateEmployeeRequest, useUpdateEmployeeRequest } from "./employee-request.hooks";
import {
  EmployeeRequestCreateData,
  EmployeeRequestStatus,
  EmployeeRequestUpdateData,
} from "./employee-request.type";

const createRequestSchema = (t: (key: string) => string) => {
  const RequestSelectSchema = createInsertSchema(employee_requests, {
    employee_id: z
      .string()
      .uuid({ message: t("EmployeeRequests.form.employee.required") })
      .nonempty({ message: t("EmployeeRequests.form.employee.required") }),
    type: z.enum(["leave", "expense", "document", "other"]),
    status: z.enum(EmployeeRequestStatus).optional(),
    title: z.string({ message: t("EmployeeRequests.form.title.required") }).min(1, {
      message: t("EmployeeRequests.form.title.required"),
    }),
    description: z.string().optional(),
    start_date: z
      .any()
      .refine((val) => val, {
        message: t("EmployeeRequests.form.date_range.start.required"),
      })
      .superRefine(
        validateYearRange(t, 1800, 2200, "EmployeeRequests.form.date_range.start.invalid"),
      )
      .optional(),
    end_date: z
      .any()
      .refine((val) => val, {
        message: t("EmployeeRequests.form.date_range.end.required"),
      })
      .superRefine(validateYearRange(t, 1800, 2200, "EmployeeRequests.form.date_range.end.invalid"))
      .optional(),

    amount: z.number().optional(),
    notes: z.any().optional().nullable(),
  });
  return RequestSelectSchema;
};

type EmployeeRequestFormSchema = ReturnType<typeof createRequestSchema>;
export type EmployeeRequestFormValues = z.input<EmployeeRequestFormSchema>;

export function EmployeeRequestForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
  nestedForm,
}: ModuleFormProps<EmployeeRequestUpdateData | EmployeeRequestCreateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const { data: employees = [], isLoading: isFetchingEmployees } = useEmployees();
  const setIsLoadingCreateEmployee = useEmployeeStore((state) => state.setIsLoading);
  const isLoadingCreateEmployee = useEmployeeStore((state) => state.isLoading);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);

  const { mutateAsync: createEmployeeRequest } = useCreateEmployeeRequest();
  const { mutateAsync: updateEmployeeRequest } = useUpdateEmployeeRequest();

  const isLoadingSave = useEmployeeRequestsStore((state) => state.isLoading);
  const setIsLoadingSave = useEmployeeRequestsStore((state) => state.setIsLoading);

  // Define literal types here, now that `t` is available
  const concreteSchema = createRequestSchema(t);
  type EmployeeRequestType = z.input<typeof concreteSchema>["type"];

  const form = useForm<EmployeeRequestFormValues>({
    resolver: zodResolver(concreteSchema),
    mode: "onChange",
    defaultValues: {
      employee_id: defaultValues?.employee_id || "",
      type: (defaultValues?.type || "leave") as EmployeeRequestType,
      status: defaultValues?.status || "draft",
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      start_date: defaultValues?.start_date ? new Date(defaultValues.start_date) : undefined,
      end_date: defaultValues?.end_date ? new Date(defaultValues.end_date) : undefined,
      amount: defaultValues?.amount || undefined,
      notes: getNotesValue(defaultValues),
    },
  });

  const employeeOptions = employees.map((emp) => {
    return {
      label: `${emp.first_name} ${emp.last_name}`,
      value: emp.email,
      id: emp.id,
    };
  });

  const handleSubmit = async (data: EmployeeRequestFormValues) => {
    setIsLoadingSave(true);

    // Convert dates to string format expected by the backend/type
    const baseSubmitData = {
      ...data,
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      notes: data.notes,
      start_date: data.start_date.toString(),
      end_date: data.end_date.toString(),
    };

    try {
      if (editMode) {
        // Ensure we only proceed if we have a valid id
        if (!defaultValues?.id) {
          console.error("Missing id for update");
          setIsLoadingSave(false);
          toast.error(t("General.error_operation"), {
            description: t("EmployeeRequests.error.update"), // Or a more specific error
          });
          return; // Stop execution if critical data is missing
        }

        // Prepare update payload - `baseSubmitData` matches EmployeeRequestFormValues (zod output)
        // EmployeeRequestUpdateData allows partial updates and matches the zod schema structure
        const updatePayload: EmployeeRequestUpdateData = baseSubmitData;

        await updateEmployeeRequest({ id: defaultValues.id, data: updatePayload });
        onSuccess?.();
      } else {
        // For create, prepare data without user_id
        const createPayload = baseSubmitData as EmployeeRequestCreateData;
        await createEmployeeRequest(createPayload);
        onSuccess?.();
      }
    } catch (error) {
      setIsLoadingSave(false);
      toast.error(t("General.error_operation"), {
        description: t("EmployeeRequests.error.create"),
      });
    }
  };

  const requestTypes = [
    { label: t("EmployeeRequests.form.type.leave"), value: "leave" },
    { label: t("EmployeeRequests.form.type.expense"), value: "expense" },
    { label: t("EmployeeRequests.form.type.document"), value: "document" },
    { label: t("EmployeeRequests.form.type.other"), value: "other" },
  ] as const;

  if (typeof window !== "undefined") {
    (window as any).employeeRequestForm = form;
  }

  return (
    <>
      <Form {...form}>
        <form id={formHtmlId || "employee-request-form"} onSubmit={form.handleSubmit(handleSubmit)}>
          <input hidden type="text" value={user?.id} {...form.register("user_id")} />
          <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />
          <div className="form-container">
            <div className="form-fields-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("EmployeeRequests.form.title.label")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("EmployeeRequests.form.title.placeholder")}
                        disabled={isLoadingSave}
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
                  <FormItem>
                    <FormLabel>{t("EmployeeRequests.form.type.label")}</FormLabel>
                    <FormControl>
                      <Select
                        dir={locale === "ar" ? "rtl" : "ltr"}
                        disabled={isLoadingSave}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("EmployeeRequests.form.description.label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t("EmployeeRequests.form.description.placeholder")}
                      disabled={isLoadingSave}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="form-fields-cols-2">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("EmployeeRequests.form.employee.label")} *</FormLabel>
                    <FormControl>
                      <ComboboxAdd
                        dir={locale === "ar" ? "rtl" : "ltr"}
                        data={employeeOptions}
                        disabled={isLoadingSave}
                        isLoading={isFetchingEmployees}
                        defaultValue={field.value}
                        valueKey={"id"}
                        onChange={(value) => {
                          field.onChange(value || null);
                        }}
                        renderOption={(item) => {
                          return (
                            <div className="flex flex-col">
                              <span>{item.label}</span>
                              <span className="text-muted-foreground text-sm">{item.value}</span>
                            </div>
                          );
                        }}
                        texts={{
                          placeholder: t("EmployeeRequests.form.employee.placeholder"),
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
                    <FormLabel>{t("EmployeeRequests.form.status.label")} *</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("EmployeeRequests.form.status.placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {EmployeeRequestStatus.map((status) => (
                          <SelectItem key={status} value={status}>
                            {t(`EmployeeRequests.form.status.${status}`)}
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
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("EmployeeRequests.form.date_range.start")}</FormLabel>
                    <FormControl>
                      <DateInput
                        placeholder={t("EmployeeRequests.form.date_range.start")}
                        value={
                          typeof field.value === "string"
                            ? parseDate(field.value)
                            : (field.value ?? null)
                        }
                        onChange={field.onChange}
                        onSelect={(e) => field.onChange(e)}
                        disabled={isLoadingSave}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("EmployeeRequests.form.date_range.end")}</FormLabel>
                    <FormControl>
                      <DateInput
                        placeholder={t("EmployeeRequests.form.date_range.end")}
                        value={
                          typeof field.value === "string"
                            ? parseDate(field.value)
                            : (field.value ?? null)
                        }
                        onChange={field.onChange}
                        onSelect={(e) => field.onChange(e)}
                        disabled={isLoadingSave}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("EmployeeRequests.form.amount.label")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      placeholder={t("EmployeeRequests.form.amount.placeholder")}
                      disabled={isLoadingSave}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <NotesSection
            inDialog={editMode || nestedForm}
            control={form.control}
            title={t("EmployeeRequests.form.notes.label")}
          />
        </form>
      </Form>

      <FormDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        title={t("Pages.Employees.add")}
        formId="employee-form"
        loadingSave={isLoadingCreateEmployee}
      >
        <EmployeeForm
          nestedForm
          formHtmlId="employee-form"
          onSuccess={() => {
            setIsEmployeeDialogOpen(false);
            setIsLoadingCreateEmployee(false);
          }}
        />
      </FormDialog>
    </>
  );
}
