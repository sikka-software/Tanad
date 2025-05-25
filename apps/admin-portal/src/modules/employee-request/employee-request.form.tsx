import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { createInsertSchema } from "drizzle-zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { DateInput } from "@/ui/inputs/date-input";
import { Input } from "@/ui/inputs/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import NotesSection from "@/components/forms/notes-section";

import { formatToYYYYMMDD } from "@/utils/date-utils";
import { getNotesValue, validateYearRange } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import EmployeeCombobox from "@/employee/employee.combobox";
import { useEmployees } from "@/employee/employee.hooks";
import useEmployeeStore from "@/employee/employee.store";

import {
  useCreateEmployeeRequest,
  useUpdateEmployeeRequest,
} from "@/employee-request/employee-request.hooks";
import useEmployeeRequestsStore from "@/employee-request/employee-request.store";
import {
  EmployeeRequestCreateData,
  EmployeeRequestStatus,
  EmployeeRequestType,
  EmployeeRequestTypeProps,
  EmployeeRequestUpdateData,
} from "@/employee-request/employee-request.type";

import { employee_requests } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

const createRequestSchema = (t: (key: string) => string) => {
  const RequestSelectSchema = createInsertSchema(employee_requests, {
    employee_id: z
      .string({ message: t("EmployeeRequests.form.employee.required") })
      .uuid({ message: t("EmployeeRequests.form.employee.required") })
      .nonempty({ message: t("EmployeeRequests.form.employee.required") }),
    title: z.string({ message: t("EmployeeRequests.form.title.required") }).min(1, {
      message: t("EmployeeRequests.form.title.required"),
    }),
    type: z.enum(EmployeeRequestType, {
      message: t("EmployeeRequests.form.type.required"),
    }),
    status: z.enum(EmployeeRequestStatus, {
      message: t("EmployeeRequests.form.status.required"),
    }),
    start_date: z
      .any()
      .refine((val) => val, {
        message: t("EmployeeRequests.form.start_date.required"),
      })
      .superRefine(validateYearRange(t, 1800, 2200, "EmployeeRequests.form.start_date.invalid"))
      .optional()
      .nullable(),
    end_date: z
      .any()
      .refine((val) => val, {
        message: t("EmployeeRequests.form.end_date.required"),
      })
      .superRefine(validateYearRange(t, 1800, 2200, "EmployeeRequests.form.end_date.invalid"))
      .optional()
      .nullable(),
    amount: z.number().optional().nullable(),
    notes: z.any().optional().nullable(),
  });
  return RequestSelectSchema;
};

export type EmployeeRequestFormValues = z.input<ReturnType<typeof createRequestSchema>>;

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
  const isLoadingCreateEmployee = useEmployeeStore((state) => state.isLoading);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);

  const { mutateAsync: createEmployeeRequest } = useCreateEmployeeRequest();
  const { mutateAsync: updateEmployeeRequest } = useUpdateEmployeeRequest();

  const isLoadingSave = useEmployeeRequestsStore((state) => state.isLoading);
  const setIsLoadingSave = useEmployeeRequestsStore((state) => state.setIsLoading);

  const form = useForm<EmployeeRequestFormValues>({
    resolver: zodResolver(createRequestSchema(t)),
    mode: "onChange",
    defaultValues: {
      ...defaultValues,
      start_date: formatToYYYYMMDD(defaultValues?.start_date),
      end_date: formatToYYYYMMDD(defaultValues?.end_date),
      notes: getNotesValue(defaultValues),
    },
  });

  const handleSubmit = async (data: EmployeeRequestFormValues) => {
    setIsLoadingSave(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    const payload = {
      ...data,
      type: data.type as EmployeeRequestTypeProps,
      start_date: formatToYYYYMMDD(data.start_date),
      end_date: formatToYYYYMMDD(data.end_date),
    };

    try {
      if (editMode && defaultValues?.id) {
        await updateEmployeeRequest({ id: defaultValues.id, data: payload });
        onSuccess?.();
      } else {
        await createEmployeeRequest(payload, {
          onSuccess: () => onSuccess?.(),
          onError: () => setIsLoadingSave(false),
        });
      }
    } catch (error) {
      setIsLoadingSave(false);
    }
  };

  if (typeof window !== "undefined") {
    (window as any).employeeRequestForm = form;
  }

  return (
    <>
      <Form {...form}>
        <form
          id={formHtmlId || "employee-request-form"}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(handleSubmit)(e);
          }}
        >
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
                          {EmployeeRequestType.map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(`EmployeeRequests.form.type.${type}`)}
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
                      value={field.value ?? ""}
                      placeholder={t("EmployeeRequests.form.description.placeholder")}
                      disabled={isLoadingSave}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="form-fields-cols-2">
              <EmployeeCombobox
                formName="employee_id"
                label={t("EmployeeRequests.form.employee.label")}
                control={form.control}
                employees={employees || []}
                loadingCombobox={isFetchingEmployees}
                isSaving={isLoadingCreateEmployee}
                isDialogOpen={isEmployeeDialogOpen}
                setIsDialogOpen={setIsEmployeeDialogOpen}
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
                    <FormLabel>{t("EmployeeRequests.form.start_date.label")}</FormLabel>
                    <FormControl>
                      <DateInput
                        placeholder={t("EmployeeRequests.form.start_date.placeholder")}
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
                    <FormLabel>{t("EmployeeRequests.form.end_date.label")}</FormLabel>
                    <FormControl>
                      <DateInput
                        placeholder={t("EmployeeRequests.form.end_date.placeholder")}
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
                      value={field.value ?? ""}
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
    </>
  );
}
