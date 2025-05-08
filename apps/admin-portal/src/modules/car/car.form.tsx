import { zodResolver } from "@hookform/resolvers/zod";
import { CurrencyInput } from "@root/src/components/ui/currency-input";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useCars, useCreateCar, useUpdateCar } from "./car.hooks";
import useCarStore from "./car.store";
import { Car, CarUpdateData, CarCreateData } from "./car.type";

export const createCarSchema = (t: (key: string) => string) => {
  const baseCarSchema = z.object({
    name: z.string().min(1, t("Cars.form.name.required")),
    make: z.string().optional().or(z.literal("")),
    model: z.string().optional().or(z.literal("")),
    year: z.string().optional().or(z.literal("")),
    color: z.string().optional().or(z.literal("")),
    vin: z.string().optional().or(z.literal("")),
    code: z.string().optional().or(z.literal("")),
    liscese_country: z.string().optional().or(z.literal("")),
    license_plate: z.string().optional().or(z.literal("")),
  });

  return baseCarSchema;
};

export type CarFormValues = z.input<ReturnType<typeof createCarSchema>>;

export interface CarFormProps {
  id?: string;
  onSuccess?: () => void;
  defaultValues?: CarUpdateData | null;
  editMode?: boolean;
}

export function CarForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<CarUpdateData | CarCreateData>) {
  const t = useTranslations();
  const lang = useLocale();

  const user = useUserStore((state) => state.user);
  const membership = useUserStore((state) => state.membership);

  const { mutate: createCar } = useCreateCar();
  const { mutate: updateCar } = useUpdateCar();

  const isLoading = useCarStore((state) => state.isLoading);
  const setIsLoading = useCarStore((state) => state.setIsLoading);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(createCarSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      make: defaultValues?.make || "",
      model: defaultValues?.model || "",
      year: defaultValues?.year || "",
      color: defaultValues?.color || "",
      vin: defaultValues?.vin || "",
      code: defaultValues?.code || "",
      liscese_country: defaultValues?.liscese_country || "",
      license_plate: defaultValues?.license_plate || "",
    },
  });

  const handleSubmit = async (data: CarFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode) {
        await updateCar(
          {
            id: defaultValues?.id || "",
            data: {
              name: data.name.trim(),
              make: data.make?.trim() || "",
              model: data.model?.trim() || "",
              year: data.year?.trim() || "",
              color: data.color?.trim() || "",
              vin: data.vin?.trim() || "",
              code: data.code?.trim() || "",
              liscese_country: data.liscese_country?.trim() || "",
              license_plate: data.license_plate?.trim() || "",
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
        await createCar(
          {
            name: data.name.trim(),
            make: data.make?.trim() || "",
            model: data.model?.trim() || "",
            year: data.year?.trim() || "",
            color: data.color?.trim() || "",
            vin: data.vin?.trim() || "",
            code: data.code?.trim() || "",
            liscese_country: data.liscese_country?.trim() || "",
            license_plate: data.license_plate?.trim() || "",
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
      console.error("Failed to save domain:", error);
      toast.error(t("General.error_operation"), {
        description: t("Domains.error.create"),
      });
    }
  };

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).domainForm = form;
  }

  return (
    <Form {...form}>
      <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Cars.form.name.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Cars.form.name.placeholder")}
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
              name="registrar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Domains.form.registrar.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Domains.form.registrar.placeholder")}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="monthly_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Domains.form.monthly_cost.label")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      placeholder={t("Domains.form.monthly_cost.placeholder")}
                      disabled={isLoading}
                      {...field}
                      showCommas={true}
                      value={field.value ? parseFloat(String(field.value)) : undefined}
                      onChange={(value) => field.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="annual_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Domains.form.annual_cost.label")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      placeholder={t("Domains.form.annual_cost.placeholder")}
                      disabled={isLoading}
                      {...field}
                      showCommas={true}
                      value={field.value ? parseFloat(String(field.value)) : undefined}
                      onChange={(value) => field.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="payment_cycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Domains.form.payment_cycle.label")}</FormLabel>
                  <FormControl>
                    <Select dir={lang === "ar" ? "rtl" : "ltr"}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Domains.form.payment_cycle.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">
                          {t("Domains.form.payment_cycle.monthly")}
                        </SelectItem>
                        <SelectItem value="annual">
                          {t("Domains.form.payment_cycle.annual")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Domains.form.status.label")}</FormLabel>
                  <FormControl>
                    <Select dir={lang === "ar" ? "rtl" : "ltr"} {...field} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Domains.form.status.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">{t("Domains.form.status.active")}</SelectItem>
                        <SelectItem value="inactive">
                          {t("Domains.form.status.inactive")}
                        </SelectItem>
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
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Domains.form.notes.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Domains.form.notes.placeholder")}
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
      </form>
    </Form>
  );
}
