import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { ComboboxAdd } from "@/ui/combobox-add";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import { cn } from "@/lib/utils";

import useEmployeeRequestsStore from "@/modules/employee-request/employee-request.store";
import { EmployeeForm } from "@/modules/employee/employee.form";
import { useEmployees } from "@/modules/employee/employee.hooks";
import useEmployeeStore from "@/modules/employee/employee.store";

const createRequestSchema = (t: (key: string) => string) =>
  z.object({
    employee_id: z
      .string({ message: t("EmployeeRequests.form.employee.required") })
      .nonempty({ message: t("EmployeeRequests.form.employee.required") })
      .uuid({ message: t("EmployeeRequests.form.employee.required") }),

    type: z.enum(["leave", "expense", "document", "other"]),
    status: z.enum(["pending", "approved", "rejected"]).default("pending"),
    title: z.string({ message: t("EmployeeRequests.form.title.required") }).min(1),
    description: z.string().optional(),
    start_date: z.date().optional(),
    end_date: z.date().optional(),
    amount: z.number().optional(),
    // attachments: z.array(z.any()).default([]),
    notes: z.string().optional(),
  });

export type EmployeeRequestFormValues = z.input<ReturnType<typeof createRequestSchema>>;

interface EmployeeRequestFormProps {
  id?: string;
  employee_id?: string;
  onSubmit: (data: EmployeeRequestFormValues) => void;
  loading?: boolean;
}

const EmployeeRequestForm = ({ id, employee_id, onSubmit }: EmployeeRequestFormProps) => {
  const t = useTranslations();
  const locale = useLocale();

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const setIsLoadingCreateEmployee = useEmployeeStore((state) => state.setIsLoading);
  const isLoadingCreateEmployee = useEmployeeStore((state) => state.isLoading);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);

  const isLoadingSave = useEmployeeRequestsStore((state) => state.isLoading);
  const setIsLoadingSave = useEmployeeRequestsStore((state) => state.setIsLoading);

  const form = useForm<EmployeeRequestFormValues>({
    resolver: zodResolver(createRequestSchema(t)),
    mode: "onChange",
    defaultValues: {
      employee_id: employee_id || "",
      type: "leave",
      status: "pending",
      title: "",
      description: "",
      start_date: undefined,
      end_date: undefined,
      amount: undefined,
      // attachments: [],
      notes: "",
    },
  });

  // Format employees for ComboboxAdd
  const employeeOptions = employees.map((emp) => {
    return {
      label: `${emp.first_name} ${emp.last_name}`,
      value: emp.email,
      id: emp.id,
    };
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // errors
    console.log("errors are ", form.formState.errors);
    console.log("form values are ", form.getValues("employee_id"));
    try {
      setIsLoadingSave(true);
      const isValid = await form.trigger();
      if (!isValid) {
        setIsLoadingSave(false);
        return;
      }
      await form.handleSubmit(onSubmit)();
    } catch (error) {
      setIsLoadingSave(false);
      console.error("Error submitting form:", error);
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
        <form
          id={id || "employee-request-form"}
          onSubmit={handleSubmit}
          // Debugging
          // onSubmit={(e) => {
          //   e.preventDefault();
          //   console.log("Form submitted");
          //   // see if any form erros
          //   const errors = form.formState.errors;
          //   console.log("errors ", errors);
          //   console.log("form values ", form.getValues());
          // }}
          className="space-y-4"
        >
          {/* <input type="hidden" {...form.register("employee_id")} /> */}
          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("EmployeeRequests.form.employee.label")} *</FormLabel>
                <FormControl>
                  <ComboboxAdd
                    direction={locale === "ar" ? "rtl" : "ltr"}
                    data={employeeOptions}
                    disabled={isLoadingSave}
                    isLoading={employeesLoading}
                    defaultValue={field.value}
                    valueKey={"id"}
                    onChange={(value) => {
                      console.log(value);
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
              <FormItem>
                <FormLabel>{t("EmployeeRequests.form.type.label")}</FormLabel>
                <FormControl>
                  <Select
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

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("EmployeeRequests.form.notes.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={t("EmployeeRequests.form.notes.placeholder")}
                    disabled={isLoadingSave}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <FormDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        title={t("Employees.add_new")}
        formId="employee-form"
        loadingSave={isLoadingCreateEmployee}
      >
        <EmployeeForm
          id="employee-form"
          onSuccess={() => {
            setIsEmployeeDialogOpen(false);
            setIsLoadingCreateEmployee(false);
          }}
        />
      </FormDialog>
    </>
  );
};

export default EmployeeRequestForm;
