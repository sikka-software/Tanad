import { zodResolver } from "@hookform/resolvers/zod";
import NotesSection from "@root/src/components/forms/notes-section";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { ComboboxAdd } from "@root/src/components/ui/comboboxes/combobox-add";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import { cn, getNotesValue } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import { EmployeeForm } from "@/employee/employee.form";
import { useEmployees } from "@/employee/employee.hooks";
import useEmployeeStore from "@/employee/employee.store";

import useEmployeeRequestsStore from "@/employee-request/employee-request.store";

import useUserStore from "@/stores/use-user-store";

import { useCreateEmployeeRequest, useUpdateEmployeeRequest } from "./employee-request.hooks";
import { EmployeeRequestCreateData, EmployeeRequestUpdateData } from "./employee-request.type";

const createRequestSchema = (t: (key: string) => string) =>
  z.object({
    employee_id: z
      .string()
      .uuid({ message: t("EmployeeRequests.form.employee.required") })
      .nonempty({ message: t("EmployeeRequests.form.employee.required") }),
    type: z.enum(["leave", "expense", "document", "other"]),
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    title: z.string({ message: t("EmployeeRequests.form.title.required") }).min(1, {
      message: t("EmployeeRequests.form.title.required"),
    }),
    description: z.string().optional(),
    start_date: z.date().optional(),
    end_date: z.date().optional(),
    amount: z.number().optional(),
    notes: z.any().optional().nullable(),
  });

type EmployeeRequestFormSchema = ReturnType<typeof createRequestSchema>;
export type EmployeeRequestFormValues = z.infer<EmployeeRequestFormSchema>;

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

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const setIsLoadingCreateEmployee = useEmployeeStore((state) => state.setIsLoading);
  const isLoadingCreateEmployee = useEmployeeStore((state) => state.isLoading);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);

  const { mutateAsync: createEmployeeRequest, isPending: isCreating } = useCreateEmployeeRequest();
  const { mutateAsync: updateEmployeeRequest, isPending: isUpdating } = useUpdateEmployeeRequest();

  const isLoadingSave = useEmployeeRequestsStore((state) => state.isLoading);
  const setIsLoadingSave = useEmployeeRequestsStore((state) => state.setIsLoading);

  // Define literal types here, now that `t` is available
  const concreteSchema = createRequestSchema(t);
  type EmployeeRequestType = z.infer<typeof concreteSchema>["type"];
  type EmployeeRequestStatus = z.infer<typeof concreteSchema>["status"];

  const form = useForm<EmployeeRequestFormValues>({
    resolver: zodResolver(concreteSchema),
    mode: "onChange",
    defaultValues: {
      employee_id: defaultValues?.employee_id || "",
      type: (defaultValues?.type || "leave") as EmployeeRequestType,
      status: (defaultValues?.status || "pending") as EmployeeRequestStatus,
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
      start_date: data.start_date ? data.start_date.toISOString() : undefined,
      end_date: data.end_date ? data.end_date.toISOString() : undefined,
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

        await updateEmployeeRequest({
          id: defaultValues.id,
          updates: updatePayload,
        });
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
          <div className="form-container">
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("EmployeeRequests.form.employee.label")} *</FormLabel>
                  <FormControl>
                    <ComboboxAdd
                      ariaInvalid={form.formState.errors.employee_id !== undefined}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                      data={employeeOptions}
                      disabled={isLoadingSave}
                      isLoading={employeesLoading}
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
                        searchPlaceholder: t("Employees.search_employees"),
                        noItems: t("EmployeeRequests.form.employee.no_employees"),
                      }}
                      addText={t("Employees.add")}
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("EmployeeRequests.form.date_range.start")}</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                            disabled={isLoadingSave}
                          >
                            <CalendarIcon className="me-2 h-4 w-4" />
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                            disabled={isLoadingSave}
                          >
                            <CalendarIcon className="me-2 h-4 w-4" />
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
