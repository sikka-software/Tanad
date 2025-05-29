import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import CountryInput from "@/ui/inputs/country-input";
import { CurrencyInput } from "@/ui/inputs/currency-input";
import DigitsInput from "@/ui/inputs/digits-input";
import { Input } from "@/ui/inputs/input";
import LicensePlateInput from "@/ui/inputs/license-plate-input";
import NumberInput from "@/ui/inputs/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { getNotesValue } from "@/lib/utils";

import { ModuleFormProps, PaymentCycle } from "@/types/common.type";
import { VehicleStatus } from "@/types/common.type";
import { VehicleOwnershipStatus } from "@/types/vehicle.types";

import { useCreateCar, useUpdateCar } from "@/car/car.hooks";
import useCarStore from "@/car/car.store";
import { CarUpdateData, CarCreateData } from "@/car/car.type";

import { cars } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

export const createCarSchema = (t: (key: string) => string) => {
  const CarSelectSchema = createInsertSchema(cars, {
    name: z
      .string({ message: t("Cars.form.name.required") })
      .min(1, { message: t("Cars.form.name.required") }),
    make: z
      .string({ message: t("Vehicles.form.make.required") })
      .min(1, t("Vehicles.form.make.required")),
    model: z
      .string({ message: t("Vehicles.form.model.required") })
      .min(1, t("Vehicles.form.model.required")),
    year: z.number({
      message: t("Forms.must_be_number"),
    }),
    vin: z
      .string()
      .optional()
      .refine((val) => !val || /^[A-Za-z0-9]+$/.test(val), {
        message: t("Vehicles.form.vin.invalid"),
      })
      .refine((val) => !val || val.length === 17, {
        message: t("Vehicles.form.vin.exact_length"),
      }).nullable,
    ownership_status: z
      .enum(VehicleOwnershipStatus, {
        message: t("Vehicles.form.ownership_status.required"),
      })
      .default("owned"),

    monthly_payment: z.string({ message: t("Forms.must_be_number") }).optional(),
    daily_payment: z.string({ message: t("Forms.must_be_number") }).optional(),
    weekly_payment: z.string({ message: t("Forms.must_be_number") }).optional(),
    annual_payment: z.string({ message: t("Forms.must_be_number") }).optional(),
    payment_cycle: z.enum(PaymentCycle).default("monthly"),
    status: z.enum(VehicleStatus).optional(),
    notes: z.any().optional().nullable(),
  });

  return CarSelectSchema;
};

export type CarFormValues = z.input<ReturnType<typeof createCarSchema>>;

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
  const setIsLoadingSave = useCarStore((state) => state.setIsLoading);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(createCarSchema(t)),
    defaultValues: {
      ...defaultValues,
      vin: defaultValues?.vin || "",
      code: defaultValues?.code || "",
      license_country: defaultValues?.license_country || "",
      license_plate: defaultValues?.license_plate || "",
      ownership_status: defaultValues?.ownership_status || "owned",
      monthly_payment: defaultValues?.monthly_payment || undefined,
      daily_payment: defaultValues?.daily_payment || undefined,
      weekly_payment: defaultValues?.weekly_payment || undefined,
      annual_payment: defaultValues?.annual_payment || undefined,
      payment_cycle: defaultValues?.payment_cycle || "monthly",
      status: defaultValues?.status || "active",
      notes: getNotesValue(defaultValues),
    },
  });

  const handleSubmit = async (data: CarFormValues) => {
    setIsLoadingSave(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode && defaultValues?.id) {
        await updateCar(
          { id: defaultValues.id, data },
          {
            onSuccess: () => onSuccess?.(),
            onError: () => setIsLoadingSave(false),
          },
        );
      } else {
        await createCar(data, {
          onSuccess: () => onSuccess?.(),
          onError: () => setIsLoadingSave(false),
        });
      }
    } catch (error) {
      setIsLoadingSave(false);
      console.error("Failed to save car:", error);
    }
  };

  if (typeof window !== "undefined") {
    (window as any).carForm = form;
  }

  return (
    <Form {...form}>
      <form
        id={formHtmlId || "car-form"}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(form.getValues());
          form.handleSubmit(handleSubmit)(e);
        }}
      >
        <div className="form-container">
          <input hidden type="text" value={user?.id} {...form.register("user_id")} />
          <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />
          <div className="form-fields-cols-2">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Vehicles.form.status.label")}</FormLabel>
                  <FormControl>
                    <Select
                      key={field.value}
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                    >
                      <FormControl>
                        <SelectTrigger value={field.value}>
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
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LicensePlateInput />
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
              name="ownership_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Vehicles.form.ownership_status.label")}</FormLabel>
                  <FormControl>
                    <Select
                      key={field.value}
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                    >
                      <FormControl>
                        <SelectTrigger onClear={() => field.onChange("")} value={field.value}>
                          <SelectValue
                            placeholder={t("Vehicles.form.ownership_status.placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VehicleOwnershipStatus.map((typeOpt) => (
                          <SelectItem key={typeOpt} value={typeOpt}>
                            {t(`Vehicles.form.ownership_status.${typeOpt}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(form.watch("ownership_status") === "financed" ||
              form.watch("ownership_status") === "rented") && (
              <FormField
                control={form.control}
                name="payment_cycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("PaymentCycles.label")}</FormLabel>
                    <FormControl>
                      <Select
                        dir={lang === "ar" ? "rtl" : "ltr"}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("PaymentCycles.placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">{t("PaymentCycles.daily")}</SelectItem>
                          <SelectItem value="weekly">{t("PaymentCycles.weekly")}</SelectItem>
                          <SelectItem value="monthly">{t("PaymentCycles.monthly")}</SelectItem>
                          <SelectItem value="annual">{t("PaymentCycles.annual")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {(form.watch("ownership_status") === "financed" ||
              form.watch("ownership_status") === "rented") &&
              form.watch("payment_cycle") === "daily" && (
                <FormField
                  control={form.control}
                  name="daily_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("PaymentCycles.daily_payment.label")}</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          {...field}
                          placeholder={t("PaymentCycles.daily_payment.placeholder")}
                          disabled={isLoading}
                          showCommas={true}
                          value={field.value ? Number(field.value) : undefined}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            {(form.watch("ownership_status") === "financed" ||
              form.watch("ownership_status") === "rented") &&
              form.watch("payment_cycle") === "weekly" && (
                <FormField
                  control={form.control}
                  name="weekly_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("PaymentCycles.weekly_payment.label")}</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          {...field}
                          placeholder={t("PaymentCycles.weekly_payment.placeholder")}
                          disabled={isLoading}
                          showCommas={true}
                          value={field.value ? Number(field.value) : undefined}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            {(form.watch("ownership_status") === "financed" ||
              form.watch("ownership_status") === "rented") &&
              form.watch("payment_cycle") === "monthly" && (
                <FormField
                  control={form.control}
                  name="monthly_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("PaymentCycles.monthly_payment.label")}</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          {...field}
                          placeholder={t("PaymentCycles.monthly_payment.placeholder")}
                          disabled={isLoading}
                          showCommas={true}
                          value={field.value ? Number(field.value) : undefined}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            {(form.watch("ownership_status") === "financed" ||
              form.watch("ownership_status") === "rented") &&
              form.watch("payment_cycle") === "annual" && (
                <FormField
                  control={form.control}
                  name="annual_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("PaymentCycles.annual_payment.label")}</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          {...field}
                          placeholder={t("PaymentCycles.annual_payment.placeholder")}
                          disabled={isLoading}
                          showCommas={true}
                          value={field.value ? Number(field.value) : undefined}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                      value={field.value ?? ""}
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
                  <DigitsInput disabled={isLoading} {...field} value={field.value ?? ""} />
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
                      value={field.value ?? ""}
                    />
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
