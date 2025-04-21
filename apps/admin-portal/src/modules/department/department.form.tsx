import { zodResolver } from "@hookform/resolvers/zod";
import { BuildingIcon, StoreIcon, WarehouseIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { MultiSelect, MultiSelectOption } from "@/ui/multi-select";
import { Textarea } from "@/ui/textarea";

import { useBranches } from "@/modules/branch/branch.hooks";
import { useOffices } from "@/modules/office/office.hooks";
import { useWarehouses } from "@/modules/warehouse/warehouse.hooks";
import useUserStore from "@/stores/use-user-store";

export const createDepartmentSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Departments.form.validation.name_required")),
    description: z.string().optional(),
    locations: z.array(z.string()).min(1, t("Departments.form.validation.locations_required")),
  });

export type DepartmentFormValues = z.input<ReturnType<typeof createDepartmentSchema>>;

interface DepartmentFormProps {
  id?: string;
  onSuccess?: (data: DepartmentFormValues) => Promise<void>;
  loading?: boolean;
  defaultValues?: Partial<DepartmentFormValues>;
}

export default function DepartmentForm({
  id,
  onSuccess,
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

  const handleSubmit = async (data: DepartmentFormValues) => {
    setLoading(true);
    try {
      // Check if user ID is available
      if (!user?.id) {
        throw new Error(t("Departments.error.not_authenticated"));
      }

      // First create the department
      const { data: newDepartment, error: departmentError } = await supabase
        .from("departments")
        .insert([
          {
            name: data.name.trim(),
            description: data.description?.trim() || null,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (departmentError) throw departmentError;

      // Then create the department locations
      if (data.locations && data.locations.length > 0) {
        const locationInserts = data.locations.map((location_id) => ({
          department_id: newDepartment.id,
          location_id: location_id,
          location_type: "office", // Default to office type
        }));

        const { error: locationError } = await supabase
          .from("department_locations")
          .insert(locationInserts);

        if (locationError) throw locationError;

        // Update the department object with locations before caching
        newDepartment.locations = data.locations;
      }

      const previousDepartments = queryClient.getQueryData(departmentKeys.lists()) || [];
      queryClient.setQueryData(departmentKeys.lists(), [
        ...(Array.isArray(previousDepartments) ? previousDepartments : []),
        newDepartment,
      ]);

      // Also set the individual department query data
      queryClient.setQueryData(["departments", newDepartment.id], newDepartment);

      toast.success(t("General.successful_operation"), {
        description: t("Departments.success.created"),
      });

      router.push("/departments");
    } catch (error) {
      console.error("Failed to save department:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Departments.error.create"),
      });
      setLoading(false);
    }
  };

  if (typeof window !== "undefined") {
    (window as any).departmentForm = form;
  }

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
