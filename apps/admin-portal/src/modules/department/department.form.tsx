import { zodResolver } from "@hookform/resolvers/zod";
import { BuildingIcon, StoreIcon, WarehouseIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { MultiSelect, MultiSelectOption } from "@/ui/multi-select";
import { Textarea } from "@/ui/textarea";

import { ModuleFormProps } from "@/types/common.type";

import { useBranches } from "@/modules/branch/branch.hooks";
import { useCreateDepartment, useUpdateDepartment } from "@/modules/department/department.hooks";
import useDepartmentStore from "@/modules/department/department.store";
import {
  Department,
  DepartmentCreateData,
  DepartmentUpdateData,
  DepartmentLocation,
} from "@/modules/department/department.type";
import { useOffices } from "@/modules/office/office.hooks";
import { useWarehouses } from "@/modules/warehouse/warehouse.hooks";
import useUserStore from "@/stores/use-user-store";

type LocationValue = {
  id: string;
  type: "office" | "branch" | "warehouse";
};

type LocationOption = MultiSelectOption<LocationValue> & {
  metadata: { type: LocationValue["type"] };
};

type FormLocationData = {
  location_id: string;
  location_type: "office" | "branch" | "warehouse";
  user_id: string;
};

export const createDepartmentSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Departments.form.validation.name_required")),
    description: z.string().optional(),
    locations: z
      .array(
        z.object({
          id: z.string(),
          type: z.enum(["office", "branch", "warehouse"]),
        }),
      )
      .min(1, t("Departments.form.validation.locations_required")),
  });

export type DepartmentFormValues = z.infer<ReturnType<typeof createDepartmentSchema>>;

export default function DepartmentForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode = false,
}: ModuleFormProps<DepartmentUpdateData | DepartmentCreateData>) {
  const t = useTranslations();
  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);
  const { mutateAsync: createDepartment } = useCreateDepartment();
  const { mutate: updateDepartment } = useUpdateDepartment();

  const setIsLoading = useDepartmentStore((state) => state.setIsLoading);

  const { data: offices, isLoading: isOfficesLoading } = useOffices();
  const { data: branches, isLoading: isBranchesLoading } = useBranches();
  const { data: warehouses, isLoading: isWarehousesLoading } = useWarehouses();
  const locale = useLocale();
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);

  const initialFormLocations =
    defaultValues?.locations?.map((loc) => ({
      id: loc.location_id,
      type: loc.location_type as "office" | "branch" | "warehouse",
    })) || [];

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(createDepartmentSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      locations: initialFormLocations,
    },
  });

  useEffect(() => {
    const options: LocationOption[] = [
      ...(offices?.map((office) => ({
        id: office.id,
        label: office.name,
        value: { id: office.id, type: "office" as const },
        metadata: { type: "office" as const },
      })) || []),
      ...(branches?.map((branch) => ({
        id: branch.id,
        label: branch.name,
        value: { id: branch.id, type: "branch" as const },
        metadata: { type: "branch" as const },
      })) || []),
      ...(warehouses?.map((warehouse) => ({
        id: warehouse.id,
        label: warehouse.name,
        value: { id: warehouse.id, type: "warehouse" as const },
        metadata: { type: "warehouse" as const },
      })) || []),
    ];
    setLocationOptions(options);
  }, [offices, branches, warehouses]);

  const renderLocationOption = (option: MultiSelectOption<LocationValue>) => {
    const type = (option as LocationOption).metadata?.type;
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
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      setIsLoading(false);
      return;
    }

    try {
      if (editMode) {
        if (!defaultValues?.id) {
          toast.error(t("General.error_occurred"), {
            description: t("Departments.error.update_missing_id"),
          });
          setIsLoading(false);
          return;
        }
        const departmentId = defaultValues.id;
        try {
          const locationsForUpdate: DepartmentLocation[] = data.locations.map((location) => ({
            department_id: departmentId,
            location_id: location.id,
            location_type: location.type,
            user_id: user.id,
          }));

          const updatePayload: DepartmentUpdateData = {
            name: data.name,
            description: data.description || null,
            user_id: user.id,
            status: defaultValues.status,
            locations: locationsForUpdate,
          };

          await updateDepartment({
            id: departmentId,
            data: updatePayload as Partial<Department>,
          });

          toast.success(t("General.successful_operation"), {
            description: t("Departments.success.update"),
          });
          if (onSuccess) {
            onSuccess();
          }
        } catch (error) {
          console.error("Error updating department:", error);
          toast.error(t("General.error_occurred"), {
            description: t("Departments.error.update"),
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        try {
          const locationsForCreate = data.locations.map((location) => ({
            location_id: location.id,
            location_type: location.type,
            user_id: user.id,
          }));

          const createData: DepartmentCreateData = {
            name: data.name,
            description: data.description || null,
            user_id: user.id,
            status: "active",
            enterprise_id: enterprise?.id || "",
            locations: locationsForCreate as DepartmentLocation[],
          };

          await createDepartment(createData);

          toast.success(t("General.successful_operation"), {
            description: t("Departments.success.create"),
          });
          if (onSuccess) {
            onSuccess();
          }
        } catch (error) {
          console.error("Error creating department:", error);
          toast.error(t("General.error_occurred"), {
            description: t("Departments.error.create"),
          });
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save department:", error);
      toast.error(t("General.error_operation"), {
        description: editMode ? t("Departments.error.update") : t("Departments.error.create"),
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).departmentForm = form;
  }

  return (
    <Form {...form}>
      <form id={formHtmlId || "department-form"} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="form-container">
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
                  <MultiSelect<LocationValue>
                    loading={isOfficesLoading || isBranchesLoading || isWarehousesLoading}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    options={locationOptions}
                    onValueChange={(values) => {
                      field.onChange(values);
                    }}
                    value={field.value}
                    placeholder={t("Departments.form.locations.placeholder")}
                    variant="inverted"
                    animation={2}
                    maxCount={3}
                    renderOption={renderLocationOption}
                    getValueKey={(value) => value.id}
                    isValueEqual={(a, b) => a.id === b.id && a.type === b.type}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
