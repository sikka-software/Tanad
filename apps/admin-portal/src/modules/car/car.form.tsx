import { zodResolver } from "@hookform/resolvers/zod";
import { getNotesValue } from "@root/src/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useCreateCar, useUpdateCar } from "./car.hooks";
import useCarStore from "./car.store";
import { CarUpdateData, CarCreateData } from "./car.type";

export const createCarSchema = (t: (key: string) => string) => {
  const baseCarSchema = z.object({
    name: z.string().min(1, t("Cars.form.name.required")),
    make: z.string().optional().or(z.literal("")),
    model: z.string().optional().or(z.literal("")),
    year: z.string().optional().or(z.literal("")),
    color: z.string().optional().or(z.literal("")),
    vin: z.string().optional().or(z.literal("")),
    code: z.string().optional().or(z.literal("")),
    license_country: z.string().optional().or(z.literal("")),
    license_plate: z.string().optional().or(z.literal("")),
    notes: z.any().optional().nullable(),
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
  const enterprise = useUserStore((state) => state.enterprise);

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
      license_country: defaultValues?.license_country || "",
      license_plate: defaultValues?.license_plate || "",
      notes: getNotesValue(defaultValues),
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
              notes: data.notes || "",
              license_country: data.license_country?.trim() || "",
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
            license_country: data.license_country?.trim() || "",
            license_plate: data.license_plate?.trim() || "",
            notes: data.notes || "",
            user_id: user?.id || "",
            enterprise_id: enterprise?.id || "",
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
      console.error("Failed to save car:", error);
      toast.error(t("General.error_operation"), {
        description: t("Cars.error.create"),
      });
    }
  };

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).carForm = form;
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
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Cars.form.make.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Cars.form.make.placeholder")}
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
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Cars.form.model.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Cars.form.model.placeholder")}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Cars.form.year.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Cars.form.year.placeholder")}
                      disabled={isLoading}
                      {...field}
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Cars.form.color.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Cars.form.color.placeholder")}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Cars.form.vin.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Cars.form.vin.placeholder")}
                      disabled={isLoading}
                      {...field}
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Cars.form.code.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Cars.form.code.placeholder")}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="license_country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Cars.form.license_country.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Cars.form.license_country.placeholder")}
                      disabled={isLoading}
                      {...field}
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
              name="license_plate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Cars.form.license_plate.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Cars.form.license_plate.placeholder")}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add a similar FormField here if there's another field, or leave as is for full width on smaller screens */}
          </div>
        </div>
      </form>
    </Form>
  );
}
