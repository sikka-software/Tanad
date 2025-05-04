import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Assuming you have a multi-select component or will use checkboxes
// import MultiSelect from "@/components/ui/multi-select";
// import { Checkbox } from "@/components/ui/checkbox";

import FormSectionHeader from "./form-section-header";

interface JobListingOptionsSectionProps {
  form: UseFormReturn<any>; // Use the specific form type if available
  // Example data sources - replace with your actual data fetching logic
  availableCurrencies: { value: string; label: string }[];
  availableLocations: { id: string; name: string }[];
  availableDepartments: { id: string; name: string }[];
  loadingLocations?: boolean; // Add loading state for locations
  loadingDepartments?: boolean; // Add loading state for departments
}

const JobListingOptionsSection = ({
  form,
  availableCurrencies,
  availableLocations,
  availableDepartments,
  loadingLocations,
  loadingDepartments,
}: JobListingOptionsSectionProps) => {
  const t = useTranslations();
  return (
    <div>
      <FormSectionHeader title={t("JobListings.options.title")} />
      <div className="form-container">
        {/* Currency Selection */}
        <FormField
          control={form.control}
          name="currency" // Ensure this name matches your form schema
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("JobListings.options.currencyLabel")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("JobListings.options.currencyPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableCurrencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Enable Search & Filtering */}
        <FormField
          control={form.control}
          name="enableSearchFiltering" // Ensure this name matches your form schema
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("JobListings.options.searchFilteringLabel")}
                </FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locations" // Ensure this name matches your form schema
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("JobListings.options.locationsLabel")}</FormLabel>
              <FormControl>
                <MultiSelect
                  options={availableLocations.map((loc) => ({
                    id: loc.id,
                    value: loc.id,
                    label: loc.name,
                  }))}
                  onValueChange={field.onChange}
                  value={field.value || []} // Ensure value is always an array
                  placeholder={t("JobListings.options.locationsPlaceholder")}
                  loading={loadingLocations}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="departments" // Ensure this name matches your form schema
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("JobListings.options.departmentsLabel")}</FormLabel>

              <FormControl>
                <MultiSelect
                  options={availableDepartments.map((dept) => ({
                    id: dept.id,
                    value: dept.id,
                    label: dept.name,
                  }))}
                  onValueChange={field.onChange}
                  value={field.value || []} // Ensure value is always an array
                  placeholder={t("JobListings.options.departmentsPlaceholder")}
                  loading={loadingDepartments}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default JobListingOptionsSection;
