import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JobFormProps {
  id?: string;
  onSuccess?: () => void;
  onSubmit: (data: JobFormValues) => Promise<void>;
  loading?: boolean;
}

const jobFormSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().optional(),
  requirements: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  type: z.string().min(1, "Job type is required"),
  salary: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), "Invalid salary"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean(),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;

export function JobForm({ id, onSuccess, onSubmit, loading = false }: JobFormProps) {
  const router = useRouter();
  const t = useTranslations();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      location: "",
      department: "",
      type: "Full-time",
      salary: "",
      startDate: "",
      endDate: "",
      isActive: true,
    },
  });

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Jobs.form.start_date.label")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Jobs.form.end_date.label")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
          name="isActive"
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