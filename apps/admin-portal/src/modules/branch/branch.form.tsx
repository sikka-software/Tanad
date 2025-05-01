import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";

import { AddressFormSection } from "@/components/forms/address-form-section";
import { createAddressSchema } from "@/components/forms/address-schema";

import useUserStore from "@/stores/use-user-store";

import { useCreateBranch, useUpdateBranch } from "./branch.hooks";
import useBranchStore from "./branch.store";
import { BranchUpdateData } from "./branch.type";

export const createBranchSchema = (t: (key: string) => string) => {
  const baseBranchSchema = z.object({
    name: z.string().min(1, t("Branches.form.name.required")),
    code: z.string().min(1, t("Branches.form.code.required")),
    phone: z.string().optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
    manager: z.string().optional().or(z.literal("")),
    is_active: z.boolean().default(true),
    notes: z.string().optional().or(z.literal("")),
  });

  const addressSchema = createAddressSchema(t);

  return baseBranchSchema.merge(addressSchema);
};

export type BranchFormValues = z.input<ReturnType<typeof createBranchSchema>>;

export interface BranchFormProps {
  id?: string;
  onSuccess?: () => void;
  defaultValues?: BranchUpdateData | null;
  editMode?: boolean;
}

export function BranchForm({ id, onSuccess, defaultValues, editMode = false }: BranchFormProps) {
  const t = useTranslations();
  const { user } = useUserStore();
  const { mutate: createBranch } = useCreateBranch();
  const { mutate: updateBranch } = useUpdateBranch();

  const isLoading = useBranchStore((state) => state.isLoading);
  const setIsLoading = useBranchStore((state) => state.setIsLoading);

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(createBranchSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      code: defaultValues?.code || "",
      short_address: defaultValues?.short_address || "",
      building_number: defaultValues?.building_number || "",
      street_name: defaultValues?.street_name || "",
      city: defaultValues?.city || "",
      region: defaultValues?.region || "",
      country: defaultValues?.country || "",
      zip_code: defaultValues?.zip_code || "",
      phone: defaultValues?.phone || "",
      email: defaultValues?.email || "",
      manager: defaultValues?.manager || "",
      is_active: defaultValues?.is_active || true,
      notes: defaultValues?.notes || "",
    },
  });

  const handleSubmit = async (data: BranchFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode) {
        await updateBranch(
          {
            id: defaultValues?.id || "",
            data: {
              name: data.name.trim(),
              code: data.code?.trim() || "",
              phone: data.phone?.trim() || null,
              email: data.email?.trim() || null,
              manager: data.manager?.trim() || null,
              notes: data.notes?.trim() || null,
              is_active: data.is_active || true,
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
        await createBranch(
          {
            name: data.name.trim(),
            code: data.code.trim(),
            phone: data.phone?.trim() || null,
            email: data.email?.trim() || null,
            manager: data.manager?.trim() || null,
            notes: data.notes?.trim() || null,
            is_active: data.is_active || true,
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
    (window as any).branchForm = form;
  }

  return (
    <Form {...form}>
      <form id={id || "branch-form"} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <AddressFormSection
          title={t("Branches.form.address.label")}
          control={form.control}
          isLoading={isLoading}
        />
      </form>
    </Form>
  );
}
