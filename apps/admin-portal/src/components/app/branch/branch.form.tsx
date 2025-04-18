import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";

export const createBranchSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Branches.form.name.required")),
    code: z.string().min(1, t("Branches.form.code.required")),
    address: z.string().min(1, t("Branches.form.address.required")),
    city: z.string().min(1, t("Branches.form.city.required")),
    state: z.string().min(1, t("Branches.form.state.required")),
    zip_code: z.string().min(1, t("Branches.form.zip_code.required")),
    phone: z.string().optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
    manager: z.string().optional().or(z.literal("")),
    is_active: z.boolean().default(true),
    notes: z.string().optional().or(z.literal("")),
  });

export type BranchFormValues = z.input<ReturnType<typeof createBranchSchema>>;

export interface BranchFormProps {
  id?: string;
  user_id: string | undefined;
  onSubmit: (data: BranchFormValues) => void;
  loading?: boolean;
  initialData?: BranchFormValues;
}

export function BranchForm({ user_id, id, onSubmit, loading, initialData }: BranchFormProps) {
  const t = useTranslations();
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(createBranchSchema(t)),
    defaultValues: initialData || {
      name: "",
      code: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      phone: "",
      email: "",
      manager: "",
      is_active: true,
      notes: "",
    },
  });

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).branchForm = form;
  }

  return (
    <Form {...form}>
      <form id={id || "branch-form"} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Branches.form.name.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Branches.form.name.placeholder")}
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Branches.form.code.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Branches.form.code.placeholder")}
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Branches.form.address.label")} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Branches.form.address.placeholder")}
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Branches.form.city.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Branches.form.city.placeholder")}
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Branches.form.state.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Branches.form.state.placeholder")}
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Branches.form.zip_code.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Branches.form.zip_code.placeholder")}
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Branches.form.phone.label")}</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder={t("Branches.form.phone.placeholder")}
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Branches.form.email.label")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("Branches.form.email.placeholder")}
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="manager"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Branches.form.manager.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Branches.form.manager.placeholder")}
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("Branches.form.is_active.label")}</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Branches.form.notes.label")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("Branches.form.notes.placeholder")}
                  className="min-h-[120px]"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
