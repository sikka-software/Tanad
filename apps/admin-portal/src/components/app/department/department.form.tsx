import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useLocale, useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { BuildingIcon, StoreIcon, WarehouseIcon } from "lucide-react";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { MultiSelect, MultiSelectOption } from "@/ui/multi-select";
import { Textarea } from "@/ui/textarea";

import useUserStore from "@/stores/use-user-store";
import { useBranches } from "@/hooks/models/useBranches";
import { useOffices } from "@/hooks/models/useOffices";
import { useWarehouses } from "@/hooks/models/useWarehouses";

export const createDepartmentSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Departments.form.validation.name_required")),
    description: z.string().optional(),
    locations: z.array(z.string()).min(1, t("Departments.form.validation.locations_required")),
  });

export type DepartmentFormValues = z.input<ReturnType<typeof createDepartmentSchema>>;

interface DepartmentFormProps {
  id?: string;
  onSubmit: (data: DepartmentFormValues) => Promise<void>;
  loading?: boolean;
  defaultValues?: Partial<DepartmentFormValues>;
}

export default function DepartmentForm({
  id,
  onSubmit,
  loading = false,
  defaultValues,
}: DepartmentFormProps) {
  const t = useTranslations();
  const { data: offices } = useOffices();
  const { data: branches } = useBranches();
  const { data: warehouses } = useWarehouses();
  const { user } = useUserStore();
  const locale = useLocale();
  const [locationOptions, setLocationOptions] = useState<MultiSelectOption[]>([]);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(createDepartmentSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      locations: defaultValues?.locations || [],
    },
  });

  useEffect(() => {
    const options: MultiSelectOption[] = [
      ...(offices?.map((office) => ({
        id: office.id,
        type: "office" as const,
        label: office.name,
        value: office.id,
        metadata: { type: "office" },
      })) || []),
      ...(branches?.map((branch) => ({
        id: branch.id,
        type: "branch" as const,
        label: branch.name,
        value: branch.id,
        metadata: { type: "branch" },
      })) || []),
      ...(warehouses?.map((warehouse) => ({
        id: warehouse.id,
        type: "warehouse" as const,
        label: warehouse.name,
        value: warehouse.id,
        metadata: { type: "warehouse" },
      })) || []),
    ];
    setLocationOptions(options);
  }, [offices, branches, warehouses]);

  const renderLocationOption = (option: MultiSelectOption) => {
    const type = option.metadata?.type;
    const typeLabel = type ? t(`Locations.types.${type}`) : "";
    let typeIcon;
    switch (type) {
      case "office":
        typeIcon = <BuildingIcon className="!text-muted-foreground !size-3" />;
        break;
      case "branch":
        typeIcon = <StoreIcon className="!text-muted-foreground !size-3" />;
        break;
      case "warehouse":
        typeIcon = <WarehouseIcon className="!text-muted-foreground !size-3" />;
        break;
    }
    return (
      <div className="flex flex-col">
        <span className="text-muted-foreground flex items-center gap-2 text-xs capitalize">
          {typeIcon}
          {typeLabel}
        </span>
        <span>{option.label}</span>
      </div>
    );
  };

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Departments.form.name.label")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Departments.form.description.label")}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Departments.form.locations.label")}</FormLabel>
              <FormControl>
                <MultiSelect
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  options={locationOptions}
                  onValueChange={field.onChange}
                  defaultValue={field.value?.map((location) => location) || []}
                  placeholder={t("Departments.form.locations.placeholder")}
                  variant="inverted"
                  animation={2}
                  maxCount={3}
                  renderOption={renderLocationOption}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
