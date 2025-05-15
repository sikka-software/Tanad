import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Control } from "react-hook-form";

import CountryInput from "@/components/ui/inputs/country-input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/ui/form";
import { Input } from "@/components/ui/inputs/input";

import { Badge } from "@/components/ui/badge";
import IconButton from "@/components/ui/icon-button";
import NumberInput from "@/components/ui/inputs/number-input";

import FormSectionHeader from "./form-section-header";

interface AddressFormSectionProps {
  control: Control<any>;
  isLoading?: boolean;
  title: string;
  inDialog?: boolean;
  dir: "rtl" | "ltr";
}

export function AddressFormSection({
  control,
  isLoading = false,
  title,
  inDialog = false,
  dir,
}: AddressFormSectionProps) {
  const t = useTranslations();

  return (
    <div>
      <FormSectionHeader inDialog={inDialog} title={title} />
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <FormField
          control={control}
          name="short_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Forms.short_address.label")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    disabled={isLoading}
                    placeholder={t("Forms.short_address.placeholder")}
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
                          {t("Forms.short_address.explainer.title")}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t("Forms.short_address.explainer.description")}
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
              <FormLabel>{t("Forms.building_number.label")}</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder={t("Forms.building_number.placeholder")}
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
              <FormLabel>{t("Forms.street_name.label")}</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder={t("Forms.street_name.placeholder")}
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
              <FormLabel>{t("Forms.city.label")}</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder={t("Forms.city.placeholder")}
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
              <FormLabel>{t("Forms.region.label")}</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder={t("Forms.region.placeholder")}
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
              <FormLabel>{t("Forms.country.label")}</FormLabel>
              <FormControl>
                <CountryInput
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  disabled={isLoading}
                  dir={dir}
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
          control={control}
          name="zip_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Forms.zip_code.label")}</FormLabel>
              <FormControl>
                <NumberInput
                  disabled={isLoading}
                  placeholder={t("Forms.zip_code.placeholder")}
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
              <FormLabel>{t("Forms.additional_number.label")}</FormLabel>
              <FormControl>
                <NumberInput
                  disabled={isLoading}
                  placeholder={t("Forms.additional_number.placeholder")}
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
