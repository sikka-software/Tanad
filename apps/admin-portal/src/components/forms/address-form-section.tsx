import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Control } from "react-hook-form";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

import { Badge } from "@/components/ui/badge";
import IconButton from "@/components/ui/icon-button";
import NumberInput from "@/components/ui/number-input";
import { Separator } from "@/components/ui/separator";

// Define the shape of the form values this section expects
// Adjust this based on the actual full form schema if needed
interface AddressFormValues {
  short_address?: string;
  building_number?: string;
  street_name?: string;
  city?: string;
  region?: string;
  country?: string;
  zip_code?: string;
  additional_number?: string;
}

interface AddressFormSectionProps {
  control: Control<any>; // Use Control<AddressFormValues> or Control<any>
  isLoading?: boolean;
  title: string;
}

export function AddressFormSection({ control, isLoading = false, title }: AddressFormSectionProps) {
  const t = useTranslations();

  return (
    <div>
      <div className="bg-muted top-0 z-10 flex !min-h-12 items-center justify-between gap-4 border-y border-b px-2">
        <h2 className="ms-2 text-xl font-bold">{title}</h2>
      </div>

      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <FormField
          control={control}
          name="short_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Companies.form.short_address.label")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    disabled={isLoading}
                    placeholder={t("Companies.form.short_address.placeholder")}
                    {...field}
                    value={field.value || ""} // Ensure controlled component
                  />
                  <IconButton
                    size="icon_sm"
                    buttonType="button"
                    disabled={isLoading}
                    contentClassName="flex flex-col gap-1 max-w-40"
                    onClick={(e) => e.preventDefault()}
                    icon={<MapPin className="size-6" />}
                    label={
                      <div className="relative">
                        <Badge className="absolute -end-4 -top-2 rounded-sm rounded-e-none !rounded-t-none bg-blue-200 p-1 px-2 text-[10px] text-black dark:bg-blue-800 dark:text-white">
                          {t("General.soon")}
                        </Badge>
                        <p className="text-sm font-medium">
                          {t("Companies.form.short_address.explainer.title")}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t("Companies.form.short_address.explainer.description")}
                        </p>
                      </div>
                    }
                    className="absolute end-0.5 top-0.5"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="building_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Companies.form.building_number.label")}</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder={t("Companies.form.building_number.placeholder")}
                  {...field}
                  value={field.value || ""} // Ensure controlled component
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="street_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Companies.form.street_name.label")}</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder={t("Companies.form.street_name.placeholder")}
                  {...field}
                  value={field.value || ""} // Ensure controlled component
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Companies.form.city.label")}</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder={t("Companies.form.city.placeholder")}
                  {...field}
                  value={field.value || ""} // Ensure controlled component
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Companies.form.region.label")}</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder={t("Companies.form.region.placeholder")}
                  {...field}
                  value={field.value || ""} // Ensure controlled component
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Companies.form.country.label")}</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder={t("Companies.form.country.placeholder")}
                  {...field}
                  value={field.value || ""} // Ensure controlled component
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="zip_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Companies.form.zip_code.label")}</FormLabel>
              <FormControl>
                <NumberInput
                  disabled={isLoading}
                  placeholder={t("Companies.form.zip_code.placeholder")}
                  {...field}
                  value={field.value || ""} // Ensure controlled component
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="additional_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Companies.form.additional_number.label")}</FormLabel>
              <FormControl>
                <NumberInput
                  disabled={isLoading}
                  placeholder={t("Companies.form.additional_number.placeholder")}
                  {...field}
                  value={field.value || ""} // Ensure controlled component
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
