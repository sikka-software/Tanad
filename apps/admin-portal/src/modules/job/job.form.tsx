import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";

import { useCreateJob, useUpdateJob } from "@/job/job.hooks";
import useJobStore from "@/job/job.store";
import { JobUpdateData } from "@/job/job.type";

import useUserStore from "@/stores/use-user-store";

interface JobFormProps {
  id?: string;
  onSuccess?: () => void;
  loading?: boolean;
  defaultValues?: JobUpdateData | null;
  editMode?: boolean;
}

const createJobFormSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().min(1, t("Jobs.form.title.required")),
    description: z.string().optional(),
    requirements: z.string().optional(),
    location: z.string().optional(),
    department: z.string().optional(),
    type: z.string().min(1, t("Jobs.form.type.required")),
    salary: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        t("Jobs.form.salary.invalid"),
      ),
    start_date: z.date().optional(),
    end_date: z.date().optional(),
    is_active: z.boolean(),
  });

export type JobFormValues = z.infer<ReturnType<typeof createJobFormSchema>>;

export function JobForm({ id, defaultValues, editMode = false, onSuccess }: JobFormProps) {
  const t = useTranslations();
  const user = useUserStore((state) => state.user);

  const { mutate: createJob } = useCreateJob();
  const { mutate: updateJob } = useUpdateJob();

  const isLoading = useJobStore((state) => state.isLoading);
  const setIsLoading = useJobStore((state) => state.setIsLoading);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(createJobFormSchema(t)),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      requirements: defaultValues?.requirements || "",
      location: defaultValues?.location || "",
      department: defaultValues?.department || "",
      type: defaultValues?.type || "Full-time",
      salary: String(defaultValues?.salary) || undefined,
      start_date: defaultValues?.start_date ? new Date(defaultValues.start_date) : undefined,
      end_date: defaultValues?.end_date ? new Date(defaultValues.end_date) : undefined,
      is_active: defaultValues?.is_active || true,
    },
  });

  const handleSubmit = async (data: JobFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode) {
        await updateJob(
          {
            id: defaultValues?.id || "",
            data: {
              title: data.title.trim(),
              description: data.description?.trim() || null,
              requirements: data.requirements?.trim() || null,
              location: data.location?.trim() || null,
              department: data.department?.trim() || null,
              type: data.type.trim(),
              salary: data.salary ? parseFloat(data.salary) : null,
              is_active: data.is_active,
              start_date: data.start_date?.toISOString() || null,
              end_date: data.end_date?.toISOString() || null,
            },
          },
          {
            onSuccess: async (response) => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        );
      } else {
        await createJob(
          {
            title: data.title.trim(),
            description: data.description?.trim() || null,
            requirements: data.requirements?.trim() || null,
            location: data.location?.trim() || null,
            department: data.department?.trim() || null,
            type: data.type.trim(),
            salary: data.salary ? parseFloat(data.salary) : null,
            is_active: data.is_active,
            start_date: data.start_date?.toISOString() || null,
            end_date: data.end_date?.toISOString() || null,
            user_id: user?.id,
          },
          {
            onSuccess: async (response) => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save company:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Companies.error.creating"),
      });
    }
  };

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).jobForm = form;
  }

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Jobs.form.title.label")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("Jobs.form.title.placeholder")} {...field} />
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
                <FormLabel>{t("Jobs.form.type.label")} *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Jobs.form.type.placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Full-time">{t("Jobs.form.type.full_time")}</SelectItem>
                    <SelectItem value="Part-time">{t("Jobs.form.type.part_time")}</SelectItem>
                    <SelectItem value="Contract">{t("Jobs.form.type.contract")}</SelectItem>
                    <SelectItem value="Internship">{t("Jobs.form.type.internship")}</SelectItem>
                    <SelectItem value="Temporary">{t("Jobs.form.type.temporary")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Jobs.form.department.label")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("Jobs.form.department.placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Jobs.form.location.label")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("Jobs.form.location.placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>{t("Jobs.form.start_date.label")}</FormLabel>
                <FormControl>
                  <DatePicker
                    date={value}
                    onSelect={onChange}
                    placeholder={t("Jobs.form.start_date.placeholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>{t("Jobs.form.end_date.label")}</FormLabel>
                <FormControl>
                  <DatePicker
                    date={value}
                    onSelect={onChange}
                    placeholder={t("Jobs.form.end_date.placeholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Jobs.form.salary.label")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t("Jobs.form.salary.placeholder")}
                  {...field}
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
              <FormLabel>{t("Jobs.form.description.label")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("Jobs.form.description.placeholder")}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Jobs.form.requirements.label")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("Jobs.form.requirements.placeholder")}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("Jobs.form.is_active.label")}</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
