import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { BuildingIcon, StoreIcon, WarehouseIcon } from "lucide-react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { useBranches } from "@/hooks/useBranches";
import { useOffices } from "@/hooks/useOffices";
import { useWarehouses } from "@/hooks/useWarehouses";
import { cn } from "@/lib/utils";
import { Department } from "@/types/department.type";

export const createDepartmentSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Departments.form.validation.name_required")),
    description: z.string().min(1, t("Departments.form.validation.description_required")),
    locations: z.array(z.string()).min(1, t("Departments.form.validation.locations_required")),
  });

export type DepartmentFormValues = z.input<ReturnType<typeof createDepartmentSchema>>;

interface DepartmentFormProps {
  id?: string;
  onSubmit: (data: DepartmentFormValues) => Promise<void>;
  loading?: boolean;
  userId: string | null;
  defaultValues?: Partial<DepartmentFormValues>;
}

export default function DepartmentForm({
  id,
  onSubmit,
  loading = false,
  userId,
  defaultValues,
}: DepartmentFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const { data: offices } = useOffices();
  const { data: branches } = useBranches();
  const { data: warehouses } = useWarehouses();
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

  const handleCancel = () => {
    router.back();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t("General.cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {defaultValues ? t("General.save") : t("General.create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
