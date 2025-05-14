import { zodResolver } from "@hookform/resolvers/zod";
import CountryInput from "@root/src/components/ui/country-input";
import { CurrencyInput } from "@root/src/components/ui/currency-input";
import NumberInput from "@root/src/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@root/src/components/ui/select";
import { getNotesValue } from "@root/src/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import DigitsInput from "@/ui/digits-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

import { ModuleFormProps } from "@/types/common.type";
import { VehicleStatus } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { VEHICLE_OWNERSHIP_STATUSES } from "../employee/employee.options";
import { useCreateCar, useUpdateCar } from "./car.hooks";
import useCarStore from "./car.store";
import { CarUpdateData, CarCreateData } from "./car.type";

export const createCarSchema = (t: (key: string) => string) => {
  const baseCarSchema = z.object({
    name: z.string().min(1, t("Cars.form.name.required")),
    make: z.string().optional().or(z.literal("")),
    model: z.string().optional().or(z.literal("")),
    year: z.number({
      invalid_type_error: t("Forms.must_be_number"),
      message: t("Forms.must_be_number"),
    }),
    color: z.string().optional().or(z.literal("")),
    vin: z.string().optional().or(z.literal("")),
    code: z.string().optional().or(z.literal("")),
    license_country: z.string().optional().or(z.literal("")),
    license_plate: z.string().optional().or(z.literal("")),
    ownership_status: z.string().optional().or(z.literal("")),
    monthly_payment: z.string().optional().or(z.literal("")),
    status: z.enum(VehicleStatus).optional().or(z.literal("")),
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
      year: defaultValues?.year,
      color: defaultValues?.color || "",
      vin: defaultValues?.vin || "",
      code: defaultValues?.code || "",
      license_country: defaultValues?.license_country || "",
      license_plate: defaultValues?.license_plate || "",
      ownership_status: defaultValues?.ownership_status || "",
      monthly_payment: defaultValues?.monthly_payment?.toString() || "",
      status: defaultValues?.status || "",
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
              year: data.year,
              color: data.color?.trim() || "",
              vin: data.vin?.trim() || "",
              code: data.code?.trim() || "",
              notes: data.notes || "",
              license_country: data.license_country?.trim() || "",
              license_plate: data.license_plate?.trim() || "",
              status: data.status === "" ? null : data.status,
              ownership_status: data.ownership_status?.trim() || "",
              monthly_payment: data.monthly_payment ? parseFloat(data.monthly_payment) : null,
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
            year: data.year,
            color: data.color?.trim() || "",
            vin: data.vin?.trim() || "",
            code: data.code?.trim() || "",
            license_country: data.license_country?.trim() || "",
            license_plate: data.license_plate?.trim() || "",
            ownership_status: data.ownership_status?.trim() || "",
            monthly_payment: data.monthly_payment ? parseFloat(data.monthly_payment) : null,
            status: data.status === "" ? null : data.status,
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
        <div className="form-container">
          <div className="form-fields-cols-2">
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
                  <FormLabel>{t("Vehicles.form.make.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Vehicles.form.make.placeholder")}
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
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Vehicles.form.model.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Vehicles.form.model.placeholder")}
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
                  <FormLabel>{t("Vehicles.form.year.label")}</FormLabel>
                  <FormControl>
                    <NumberInput
                      placeholder={t("Vehicles.form.year.placeholder")}
                      disabled={isLoading}
                      maxLength={4}
                      value={field.value === undefined || field.value === null ? "" : field.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : Number(val));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Vehicles.form.color.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Vehicles.form.color.placeholder")}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Vehicles.form.vin.label")}</FormLabel>
                <FormControl>
                  <DigitsInput disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="form-fields-cols-2">
            <FormField
              control={form.control}
              name="license_country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Vehicles.form.license_country.label")}</FormLabel>
                  <FormControl>
                    <CountryInput
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      disabled={isLoading}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      ariaInvalid={false}
                      texts={{
                        placeholder: t("Forms.country.placeholder"),
                        searchPlaceholder: t("Forms.country.search_placeholder"),
                        noItems: t("Forms.country.no_items"),
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="license_plate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Vehicles.form.license_plate.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Vehicles.form.license_plate.placeholder")}
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
              name="ownership_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Vehicles.form.ownership_status.label")}</FormLabel>
                  <FormControl>
                    <Select
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger onClear={() => field.onChange("")} value={field.value}>
                          <SelectValue
                            placeholder={t("Vehicles.form.ownership_status.placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VEHICLE_OWNERSHIP_STATUSES.map((typeOpt) => (
                          <SelectItem key={typeOpt.value} value={typeOpt.value}>
                            {t(`Vehicles.form.ownership_status.${typeOpt.value}`, {
                              defaultValue: typeOpt.label,
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("ownership_status") === "financed" && (
              <FormField
                control={form.control}
                name="monthly_payment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Cars.form.monthly_payment.label")}</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder={t("Cars.form.monthly_payment.placeholder")}
                        disabled={isLoading}
                        {...field}
                        showCommas={true}
                        value={field.value ? parseFloat(String(field.value)) : undefined}
                        onChange={(value) => field.onChange(value?.toString() || "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Vehicles.form.status.label")}</FormLabel>
                  <FormControl>
                    <Select
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger onClear={() => field.onChange("")} value={field.value}>
                          <SelectValue placeholder={t("Vehicles.form.status.placeholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(VehicleStatus).map((typeOpt) => (
                          <SelectItem key={typeOpt} value={typeOpt}>
                            {t(`Vehicles.form.status.${typeOpt}`, {
                              defaultValue: typeOpt,
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
