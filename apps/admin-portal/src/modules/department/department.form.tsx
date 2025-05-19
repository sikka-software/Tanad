import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { BuildingIcon, StoreIcon, WarehouseIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/inputs/input";
import { MultiSelect, MultiSelectOption } from "@/ui/multi-select";
import { Textarea } from "@/ui/textarea";

import renderLocationOption, { LocationOption } from "@/components/app/location-options";
import { ComboboxAdd } from "@/components/ui/comboboxes/combobox-add";

import NotesSection from "@/forms/notes-section";

import { convertToPascalCase } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import { useOffices } from "@/office/office.hooks";

import { useWarehouses } from "@/warehouse/warehouse.hooks";

import { useBranches } from "@/branch/branch.hooks";

import { useCreateDepartment, useUpdateDepartment } from "@/department/department.hooks";
import useDepartmentStore from "@/department/department.store";
import {
  Department,
  DepartmentCreateData,
  DepartmentUpdateData,
  DepartmentLocation,
} from "@/department/department.type";

import { useOnlineStores } from "@/online-store/online-store.hooks";

import { departments } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

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
  const locale = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const { mutateAsync: createDepartment } = useCreateDepartment();
  const { mutate: updateDepartment } = useUpdateDepartment();

  const setIsLoading = useDepartmentStore((state) => state.setIsLoading);

  const { data: offices = [], isLoading: isOfficesLoading } = useOffices();
  const { data: branches = [], isLoading: isBranchesLoading } = useBranches();
  const { data: warehouses = [], isLoading: isWarehousesLoading } = useWarehouses();
  const { data: onlineStores = [], isLoading: isOnlineStoresLoading } = useOnlineStores();

  const isFetchingLocations =
    isOfficesLoading || isWarehousesLoading || isBranchesLoading || isOnlineStoresLoading;

  const [isChooseLocationDialogOpen, setIsChooseLocationDialogOpen] = useState(false);
  const [chosenForm, setChosenForm] = useState<
    "Warehouses" | "Offices" | "Branches" | "OnlineStores" | "Departments"
  >();

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
      locations: defaultValues?.locations || [],
    },
  });

  const locationOptions = useMemo(() => {
    let officesOptions = offices.map((location) => ({
      id: location.id,
      label: location.name,
      value: location.id,
      metadata: { type: "office" as const },
    }));
    let warehousesOptions = warehouses.map((location) => ({
      id: location.id,
      label: location.name,
      value: location.id,
      metadata: { type: "warehouse" as const },
    }));
    let branchesOptions = branches.map((location) => ({
      id: location.id,
      label: location.name,
      value: location.id,
      metadata: { type: "branch" as const },
    }));
    let onlineStoresOptions = onlineStores.map((location) => ({
      id: location.id,
      label: location.domain_name,
      value: location.id,
      metadata: { type: "online_store" as const },
    }));
    return [...officesOptions, ...warehousesOptions, ...branchesOptions, ...onlineStoresOptions];
  }, [offices, warehouses, branches, onlineStores]);

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
      <form
        id={formHtmlId || "department-form"}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit(handleSubmit)(e);
        }}
      >
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
                  <ComboboxAdd
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    data={locationOptions}
                    isLoading={isFetchingLocations}
                    {...field}
                    onChange={(value) => field.onChange(value || null)}
                    texts={{
                      placeholder: t("Jobs.form.location.placeholder"),
                      searchPlaceholder: t("Pages.Locations.search"),
                      noItems: t("Pages.Locations.no_locations_found"),
                    }}
                    addText={t("Pages.Locations.add")}
                    onAddClick={() => setIsChooseLocationDialogOpen(true)}
                    renderOption={(option) => renderLocationOption(option, t)}
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
