import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { BuildingIcon, StoreIcon, WarehouseIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { MultiSelect, MultiSelectOption } from "@/ui/multi-select";
import { Textarea } from "@/ui/textarea";

import { useBranches } from "@/modules/branch/branch.hooks";
import { useOffices } from "@/modules/office/office.hooks";
import { useWarehouses } from "@/modules/warehouse/warehouse.hooks";
import useUserStore from "@/stores/use-user-store";
import { createClient } from "@/utils/supabase/component";

import { departmentKeys } from "./department.hooks";
import { useCreateDepartment, useUpdateDepartment } from "./department.hooks";
import useDepartmentStore from "./department.store";
import type { Department, DepartmentCreateData } from "./department.type";
import { DepartmentUpdateData } from "./department.type";

export const createDepartmentSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Departments.form.validation.name_required")),
    description: z.string().optional(),
    locations: z.array(z.string()).min(1, t("Departments.form.validation.locations_required")),
  });

export type DepartmentFormValues = z.input<ReturnType<typeof createDepartmentSchema>>;

interface DepartmentFormProps {
  id?: string;
  onSuccess?: () => void;
  loading?: boolean;
  defaultValues?: DepartmentUpdateData | null;
  editMode?: boolean;
}

export default function DepartmentForm({
  id,
  onSuccess,
  loading = false,
  defaultValues,
  editMode = false,
}: DepartmentFormProps) {
  const t = useTranslations();
  const user = useUserStore((state) => state.user);
  const { mutateAsync: createDepartment } = useCreateDepartment();
  const { mutate: updateDepartment } = useUpdateDepartment();
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const isLoading = useDepartmentStore((state) => state.isLoading);
  const setIsLoading = useDepartmentStore((state) => state.setIsLoading);

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

  const handleSubmit = async (data: DepartmentFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }
    try {
      if (editMode) {
        try {
          await updateDepartment({
            id: id!,
            data: {
              name: data.name,
              description: data.description || null,
              user_id: user.id,
              is_active: true,
              locations: data.locations || [],
            },
          });

          toast.success(t("General.successful_operation"), {
            description: t("Departments.success.updated"),
          });
          router.push("/departments");
        } catch (error) {
          console.error("Error updating department:", error);
          toast.error(t("General.error_occurred"), {
            description: t("Departments.error.updating"),
          });
        }
      } else {
        try {
          const createData: DepartmentCreateData = {
            name: data.name,
            description: data.description || null,
            user_id: user.id,
            is_active: true,
            locations: data.locations || [],
          };

          await createDepartment(createData);

          toast.success(t("General.successful_operation"), {
            description: t("Departments.success.created"),
          });

          router.push("/departments");
        } catch (error) {
          console.error("Error creating department:", error);
          toast.error(t("General.error_occurred"), {
            description: t("Departments.error.creating"),
          });
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save department:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Departments.error.create"),
      });
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
