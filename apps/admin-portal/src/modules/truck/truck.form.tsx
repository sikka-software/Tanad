import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import CountryInput from "@/ui/inputs/country-input";
import { CurrencyInput } from "@/ui/inputs/currency-input";
import DigitsInput from "@/ui/inputs/digits-input";
import { Input } from "@/ui/inputs/input";
import NumberInput from "@/ui/inputs/number-input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/ui/select";

import { getNotesValue } from "@/lib/utils";

import { ModuleFormProps, PaymentCycle, VehicleStatus } from "@/types/common.type";
import { VehicleOwnershipStatus, VehicleSchema } from "@/types/vehicle.types";

import { useCreateTruck, useUpdateTruck } from "@/truck/truck.hooks";
import useTruckStore from "@/truck/truck.store";
import { TruckUpdateData, TruckCreateData } from "@/truck/truck.type";

import { trucks } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

export const createTruckSchema = (t: (key: string) => string) => {
  const TruckSelectSchema = createInsertSchema(trucks, {
    ...VehicleSchema,
  });

  return TruckSelectSchema;
};

export type TruckFormValues = z.input<ReturnType<typeof createTruckSchema>>;

export function TruckForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<TruckUpdateData | TruckCreateData>) {
  const t = useTranslations();
  const lang = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const { mutate: createTruck } = useCreateTruck();
  const { mutate: updateTruck } = useUpdateTruck();

  const isLoading = useTruckStore((state) => state.isLoading);
  const setIsLoadingSave = useTruckStore((state) => state.setIsLoading);

  const form = useForm<TruckFormValues>({
    resolver: zodResolver(createTruckSchema(t)),
    defaultValues: {
      ...defaultValues,
      ownership_status: defaultValues?.ownership_status || "owned",
      payment_cycle: defaultValues?.payment_cycle || "monthly",
      status: defaultValues?.status || "active",
      notes: getNotesValue(defaultValues),
    },
  });

  const handleSubmit = async (data: TruckFormValues) => {
    setIsLoadingSave(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode && defaultValues?.id) {
        await updateTruck(
          { id: defaultValues.id, data },
          {
            onSuccess: () => onSuccess?.(),
            onError: () => setIsLoadingSave(false),
          },
        );
      } else {
        await createTruck(data, {
          onSuccess: () => onSuccess?.(),
          onError: () => setIsLoadingSave(false),
        });
      }
    } catch (error) {
      setIsLoadingSave(false);
      console.error("Failed to save truck:", error);
      toast.error(t("General.error_operation"), {
        description: t("Trucks.error.create"),
      });
    }
  };

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).truckForm = form;
  }

  return (
    <Form {...form}>
      <form
        id={formHtmlId || "truck-form"}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit(handleSubmit)(e);
        }}
      >
        <input hidden type="text" value={user?.id} {...form.register("user_id")} />
        <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />
        <div className="form-container">
          <div className="form-fields-cols-2">
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
                        <SelectTrigger>
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
                  <FormMessage t={t} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Trucks.form.code.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Trucks.form.code.placeholder")}
                      disabled={isLoading}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage t={t} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Trucks.form.name.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Trucks.form.name.placeholder")}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage t={t} />
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
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger
                          disabled={isLoading}
                          onClear={() => field.onChange("")}
                          value={field.value}
                        >
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
                  <FormMessage t={t} />
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
                    <FormMessage t={t} />
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
                          placeholder={t("PaymentCycles.daily_payment.placeholder")}
                          disabled={isLoading}
                          {...field}
                          showCommas={true}
                          value={field.value ? parseFloat(String(field.value)) : undefined}
                          onChange={(value) => field.onChange(value?.toString() || "")}
                        />
                      </FormControl>
                      <FormMessage t={t} />
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
                          placeholder={t("PaymentCycles.weekly_payment.placeholder")}
                          disabled={isLoading}
                          {...field}
                          showCommas={true}
                          value={field.value ? parseFloat(String(field.value)) : undefined}
                          onChange={(value) => field.onChange(value?.toString() || "")}
                        />
                      </FormControl>
                      <FormMessage t={t} />
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
                          placeholder={t("PaymentCycles.monthly_payment.placeholder")}
                          disabled={isLoading}
                          {...field}
                          showCommas={true}
                          value={field.value ? parseFloat(String(field.value)) : undefined}
                          onChange={(value) => field.onChange(value?.toString() || "")}
                        />
                      </FormControl>
                      <FormMessage t={t} />
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
                          placeholder={t("PaymentCycles.annual_payment.placeholder")}
                          disabled={isLoading}
                          {...field}
                          showCommas={true}
                          value={field.value ? parseFloat(String(field.value)) : undefined}
                          onChange={(value) => field.onChange(value?.toString() || "")}
                        />
                      </FormControl>
                      <FormMessage t={t} />
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
                  <FormMessage t={t} />
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
                  <FormMessage t={t} />
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
                  <FormMessage t={t} />
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
                  <FormMessage t={t} />
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
                <FormMessage t={t} />
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
                  <FormMessage t={t} />
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
                  <FormMessage t={t} />
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
