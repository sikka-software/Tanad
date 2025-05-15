import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { BuildingIcon, StoreIcon, WarehouseIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { MultiSelect, MultiSelectOption } from "@/ui/multi-select";
import { Textarea } from "@/ui/textarea";

import NotesSection from "@/components/forms/notes-section";
import { Input } from "@/components/ui/inputs/input";

import { convertToPascalCase } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import { departments } from "@/db/schema";
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
const createDepartmentSchema = (t: (key: string) => string) => {
  const DepartmentSelectSchema = createInsertSchema(departments, {
    name: z.string().min(1, t("Departments.form.validation.name_required")),
    description: z.string().optional(),
  });

  const locationsSchema = z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(["office", "branch", "warehouse"]),
      }),
    )
    .min(1, t("Departments.form.validation.locations_required"));

  return DepartmentSelectSchema.extend({
    locations: locationsSchema,
  });
};

export type DepartmentFormValues = z.input<ReturnType<typeof createDepartmentSchema>>;

export default function DepartmentForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
  nestedForm,
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
    const typeLabel = type ? t(`Pages.${convertToPascalCase(type)}s.title`) : "";
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
        <span className="text-muted-foreground flex items-center gap-2 text-xs">
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
            enterprise_id: enterprise?.id || "",
          })) as DepartmentLocation[];

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

          if (onSuccess) {
            onSuccess();
          }
        } catch (error) {
          console.error("Error updating department:", error);
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

          if (onSuccess) {
            onSuccess();
          }
        } catch (error) {
          console.error("Error creating department:", error);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save department:", error);
    }
  };

  if (typeof window !== "undefined") {
    (window as any).departmentForm = form;
  }

  return (
    <Form {...form}>
      <form id={formHtmlId || "department-form"} onSubmit={form.handleSubmit(handleSubmit)}>
        <input hidden type="text" value={user?.id} {...form.register("user_id")} />
        <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />
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

        <NotesSection
          inDialog={editMode || nestedForm}
          control={form.control}
          title={t("Departments.form.notes.label")}
        />
      </form>
    </Form>
  );
}
