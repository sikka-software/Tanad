import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import type { Branch } from "@/api/branches"; // Import Branch type
import { createBranch, fetchBranchById, updateBranch } from "@/api/branches"; // Import API functions
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Schema factory for branch form validation with translations
const createBranchSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Branches.form.name.required")),
    code: z.string().min(1, t("Branches.form.code.required")),
    address: z.string().min(1, t("Branches.form.address.required")),
    city: z.string().min(1, t("Branches.form.city.required")),
    state: z.string().min(1, t("Branches.form.state.required")),
    zip_code: z.string().min(1, t("Branches.form.zip_code.required")),
    phone: z.string().optional(),
    email: z.string().email(t("Branches.form.email.invalid")).optional(),
    manager: z.string().optional(),
    is_active: z.boolean().default(true),
    notes: z.string().optional(),
  });

export type BranchFormValues = z.infer<ReturnType<typeof createBranchSchema>>;

interface BranchFormProps {
  formId?: string;
  branchId?: string;
  onSuccess?: (branch: Branch) => void;
  loading?: boolean;
  userId: string | null;
}

export function BranchForm({
  formId,
  branchId,
  onSuccess,
  loading: externalLoading = false,
  userId,
}: BranchFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

  const branchSchema = createBranchSchema(t);

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
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

  // Fetch branch data if branchId is provided (edit mode)
  useEffect(() => {
    if (branchId) {
      setInternalLoading(true);
      fetchBranchById(branchId)
        .then((branch) => {
          form.reset({
            name: branch.name,
            code: branch.code,
            address: branch.address,
            city: branch.city,
            state: branch.state,
            zip_code: branch.zip_code,
            phone: branch.phone || "",
            email: branch.email || "",
            manager: branch.manager || "",
            is_active: branch.is_active,
            notes: branch.notes || "",
          });
        })
        .catch((error) => {
          console.error("Failed to fetch branch:", error);
          toast.error(t("error.title"), {
            description: t("Branches.messages.error_fetch"),
          });
        })
        .finally(() => {
          setInternalLoading(false);
        });
    }
  }, [branchId, form, t]);

  const onSubmit: SubmitHandler<BranchFormValues> = async (data) => {
    setInternalLoading(true);
    if (!userId) {
      toast.error(t("error.title"), {
        description: t("error.not_authenticated"),
      });
      setInternalLoading(false);
      return;
    }

    try {
      const branchData = {
        name: data.name.trim(),
        code: data.code.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zip_code: data.zip_code.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        manager: data.manager?.trim() || null,
        is_active: data.is_active,
        notes: data.notes?.trim() || null,
        user_id: userId,
      };

      let result: Branch;
      if (branchId) {
        const { user_id, ...updateData } = branchData;
        result = await updateBranch(branchId, updateData);
        toast.success(t("success.title"), {
          description: t("Branches.messages.success_updated"),
        });
      } else {
        result = await createBranch(branchData);
        toast.success(t("success.title"), {
          description: t("Branches.messages.success_created"),
        });
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push("/branches");
      }
    } catch (error) {
      console.error("Failed to save branch:", error);
      toast.error(t("error.title"), {
        description:
          error instanceof Error ? error.message : t("Branches.messages.error_save"),
      });
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
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
                <FormLabel className="text-base">
                  {t("Branches.form.is_active.label")}
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={loading}
                />
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

        <Button type="submit" disabled={loading} className="w-full">
          {branchId
            ? t("Branches.form.update_button")
            : t("Branches.form.create_button")}
        </Button>
      </form>
    </Form>
  );
} 