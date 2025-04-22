import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

import useUserStore from "@/stores/use-user-store";

import { useCreateOffice, useUpdateOffice } from "./office.hooks";
import useOfficeStore from "./office.store";
import { OfficeUpdateData } from "./office.type";

const createOfficeSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Offices.form.name.required")),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().min(1, t("Offices.form.address.required")),
    city: z.string().min(1, t("Offices.form.city.required")),
    state: z.string().min(1, t("Offices.form.state.required")),
    zip_code: z.string().min(1, t("Offices.form.zip_code.required")),
  });

export type OfficeFormValues = z.input<ReturnType<typeof createOfficeSchema>>;

interface OfficeFormProps {
  id?: string;
  onSuccess?: () => void;
  defaultValues?: OfficeUpdateData | null;
  editMode?: boolean;
}

export function OfficeForm({ id, onSuccess, defaultValues, editMode }: OfficeFormProps) {
  const t = useTranslations();
  const { mutate: createOffice } = useCreateOffice();
  const { mutate: updateOffice } = useUpdateOffice();
  const { profile } = useUserStore();
  const isLoading = useOfficeStore((state) => state.isLoading);
  const setIsLoading = useOfficeStore((state) => state.setIsLoading);

  const form = useForm<OfficeFormValues>({
    resolver: zodResolver(createOfficeSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      address: defaultValues?.address || "",
      city: defaultValues?.city || "",
      state: defaultValues?.state || "",
      zip_code: defaultValues?.zip_code || "",
    },
  });

  const handleSubmit = async (data: OfficeFormValues) => {
    setIsLoading(true);
    try {
      if (editMode) {
        await updateOffice({
          id: defaultValues?.id || "",
          data: {
            name: data.name.trim(),
            email: data.email?.trim(),
            phone: data.phone?.trim(),
            address: data.address.trim(),
            city: data.city.trim(),
            state: data.state.trim(),
            zip_code: data.zip_code.trim(),
            is_active: true,
          },
        });
        toast.success(t("General.successful_operation"), {
          description: t("Offices.success.updated"),
        });
        onSuccess?.();
      } else {
        const currentProfile = profile || useUserStore.getState().profile;
        if (!currentProfile?.enterprise_id) {
          toast.error(t("General.error_operation"), {
            description: "No enterprise found. Please try logging out and back in.",
          });
          setIsLoading(false);
          return;
        }

        await createOffice({
          name: data.name.trim(),
          email: data.email?.trim(),
          phone: data.phone?.trim(),
          address: data.address.trim(),
          city: data.city.trim(),
          state: data.state.trim(),
          zip_code: data.zip_code.trim(),
          is_active: true,
          enterprise_id: currentProfile.enterprise_id,
          updated_at: new Date().toISOString(),
        });
        toast.success(t("General.successful_operation"), {
          description: t("Offices.success.created"),
        });
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error in office form:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Offices.error.creating"),
      });
      setIsLoading(false);
    }
  };

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).officeForm = form;
  }

  return (
    <Form {...form}>
      <form
        id={id || "office-form"}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Offices.form.name.label")}</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
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
              <FormLabel>{t("Offices.form.email.label")}</FormLabel>
              <FormControl>
                <Input {...field} type="email" disabled={isLoading} />
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
              <FormLabel>{t("Offices.form.phone.label")}</FormLabel>
              <FormControl>
                <Input {...field} type="tel" disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Offices.form.address.label")}</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Offices.form.city.label")}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
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
                <FormLabel>{t("Offices.form.state.label")}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
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
                <FormLabel>{t("Offices.form.zip_code.label")}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
