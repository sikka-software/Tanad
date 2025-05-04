import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
}

const JobListingOptionsSection = ({
  form,
  availableCurrencies,
  availableLocations,
  availableDepartments,
}: JobListingOptionsSectionProps) => {
  const t = useTranslations();
  return (
    <div className="space-y-6">
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

        {/* Location Selection - Placeholder using Checkboxes */}
        {/* Replace with your MultiSelect component if available */}
        <FormField
          control={form.control}
          name="locations" // Ensure this name matches your form schema
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("JobListings.options.locationsLabel")}</FormLabel>
              {/* Example using Checkboxes - Adapt as needed */}
              {/* <div className="space-y-2">
              {availableLocations.map((location) => (
                <FormField
                  key={location.id}
                  control={form.control}
                  name="locations"
                  render={({ field: itemField }) => {
                    return (
                      <FormItem
                        key={location.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={itemField.value?.includes(location.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? itemField.onChange([...itemField.value, location.id])
                                : itemField.onChange(
                                    itemField.value?.filter(
                                      (value) => value !== location.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {location.name}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div> */}
              <FormControl>
                {/* Placeholder: Replace with actual MultiSelect or Checkbox group */}
                <div className="text-muted-foreground rounded border p-2">
                  {t("JobListings.options.locationsPlaceholder")}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Department Selection - Placeholder using Checkboxes */}
        {/* Replace with your MultiSelect component if available */}
        <FormField
          control={form.control}
          name="departments" // Ensure this name matches your form schema
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("JobListings.options.departmentsLabel")}</FormLabel>
              {/* Example using Checkboxes - Adapt as needed */}
              {/* <div className="space-y-2">
               {availableDepartments.map((dept) => (
                <FormField
                  key={dept.id}
                  control={form.control}
                  name="departments"
                  render={({ field: itemField }) => {
                    return (
                      <FormItem
                        key={dept.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={itemField.value?.includes(dept.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? itemField.onChange([...itemField.value, dept.id])
                                : itemField.onChange(
                                    itemField.value?.filter(
                                      (value) => value !== dept.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {dept.name}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div> */}
              <FormControl>
                {/* Placeholder: Replace with actual MultiSelect or Checkbox group */}
                <div className="text-muted-foreground rounded border p-2">
                  {t("JobListings.options.departmentsPlaceholder")}
                </div>
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
