import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

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
import { supabase } from "@/lib/supabase";

// We'll create a schema factory to handle translations
const createClientSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    company: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip_code: z.string().min(1, "ZIP code is required"),
    notes: z.string().optional(),
  });

export type ClientFormValues = z.infer<ReturnType<typeof createClientSchema>>;

interface ClientFormProps {
  id?: string;
  onSuccess?: () => void;
  onSubmit?: (data: ClientFormValues) => Promise<void>;
  loading?: boolean;
  userId: string | null;
}

export function ClientForm({ id, onSuccess, onSubmit: externalSubmit, loading = false, userId }: ClientFormProps) {
  const router = useRouter();
  const t = useTranslations();

  const clientSchema = createClientSchema(t);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      notes: "",
    },
  });

  const onSubmit: SubmitHandler<ClientFormValues> = async (data) => {
    if (externalSubmit) {
      await externalSubmit(data);
      return;
    }

    try {
      // Check if user ID is available
      if (!userId) {
        throw new Error(t("error.not_authenticated"));
      }

      const { error } = await supabase.from("clients").insert([
        {
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          company: data.company?.trim() || "",
          address: data.address.trim(),
          city: data.city.trim(),
          state: data.state.trim(),
          zip_code: data.zip_code.trim(),
          notes: data.notes?.trim() || null,
          user_id: userId,
        },
      ]);

      if (error) throw error;

      toast.success(t("success.title"), {
        description: t("success.created"),
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/clients");
      }
    } catch (error) {
      toast.error(t("error.title"), {
        description: error instanceof Error ? error.message : t("error.create"),
      });
    }
  };

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Clients.form.name.label")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("Clients.form.name.placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Clients.form.company.label")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("Clients.form.company.placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Clients.form.email.label")} *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t("Clients.form.email.placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Clients.form.phone.label")} *</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder={t("Clients.form.phone.placeholder")} {...field} />
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
              <FormLabel>{t("Clients.form.address.label")} *</FormLabel>
              <FormControl>
                <Input placeholder={t("Clients.form.address.placeholder")} {...field} />
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
                <FormLabel>{t("Clients.form.city.label")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("Clients.form.city.placeholder")} {...field} />
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
                <FormLabel>{t("Clients.form.state.label")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("Clients.form.state.placeholder")} {...field} />
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
                <FormLabel>{t("Clients.form.zip_code.label")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("Clients.form.zip_code.placeholder")} {...field} />
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
              <FormLabel>{t("Clients.form.notes.label")}</FormLabel>
              <FormControl>
                <Textarea placeholder={t("Clients.form.notes.placeholder")} rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/clients")}>
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t("creating") : t("create_client")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
