import { useState } from "react";
import { useForm } from "react-hook-form";

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

const clientSchema = z.object({
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

export type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
  onSuccess?: () => void;
  userId: string | null;
}

export function ClientForm({ onSuccess, userId }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const t = useTranslations("Clients");

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

  const onSubmit = async (data: ClientFormValues) => {
    setLoading(true);
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
          user_id: userId, // Add the user_id field
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("full_name")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("enter_full_name")} {...field} />
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
                <FormLabel>{t("company")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enter_company_name")} {...field} />
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
                <FormLabel>{t("email")} *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t("enter_email")} {...field} />
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
                <FormLabel>{t("phone")} *</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder={t("enter_phone")} {...field} />
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
              <FormLabel>{t("address")} *</FormLabel>
              <FormControl>
                <Input placeholder={t("enter_address")} {...field} />
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
                <FormLabel>{t("city")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("enter_city")} {...field} />
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
                <FormLabel>{t("state")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("enter_state")} {...field} />
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
                <FormLabel>{t("zip_code")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("enter_zip_code")} {...field} />
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
              <FormLabel>{t("notes")}</FormLabel>
              <FormControl>
                <Textarea placeholder={t("enter_notes")} rows={4} {...field} />
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
