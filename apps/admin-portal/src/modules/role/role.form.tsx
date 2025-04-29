import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import useUserStore from "@/stores/use-user-store";

import { Permission, usePermissions } from "../permission/permission.hooks";
import { useCreateRole, useUpdateRole } from "./role.hooks";
import type { RoleCreateData, RoleUpdateData } from "./role.type";

// Add this constant for predefined roles
const AVAILABLE_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "accounting", label: "Accounting" },
  { value: "hr", label: "HR" },
] as const;

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[a-z0-9_]+$/, {
      message: "Role name must contain only lowercase letters, numbers, and underscores",
    }),
  description: z.string().nullable(),
  permissions: z.record(z.string(), z.boolean()),
});

type FormData = z.infer<typeof formSchema>;

interface RoleFormProps {
  id?: string;
  defaultValues?: RoleUpdateData & { isSystem?: boolean };
  onSuccess?: () => void;
  editMode?: boolean;
}

// Add this component for permissions section
const PermissionsSection = ({
  permissionsByCategory,
  selectedPermissions,
  onPermissionChange,
  onCategoryToggle,
  isDisabled = false,
}: {
  permissionsByCategory: Record<string, Permission[]>;
  selectedPermissions: string[];
  onPermissionChange: (permissionId: string) => void;
  onCategoryToggle: (category: string) => void;
  isDisabled?: boolean;
}) => {
  const areAllPermissionsSelected = (category: string) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    return categoryPermissions.every((p) => selectedPermissions.includes(p.id));
  };

  const countPermissionsByCategory = (category: string) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    return categoryPermissions.filter((p) => selectedPermissions.includes(p.id)).length;
  };

  return (
    <div className="space-y-4">
      {Object.entries(permissionsByCategory).map(([category, permissions]) => (
        <div key={category} className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base">{category}</FormLabel>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={areAllPermissionsSelected(category)}
                onChange={() => onCategoryToggle(category)}
                disabled={isDisabled}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-muted-foreground text-xs">
                {countPermissionsByCategory(category)}/{permissions.length}
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id={`permission-${permission.id}`}
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={() => onPermissionChange(permission.id)}
                  disabled={isDisabled}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <div>
                  <label htmlFor={`permission-${permission.id}`} className="font-medium">
                    {permission.name}
                  </label>
                  <p className="text-muted-foreground text-sm">{permission.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export function RoleForm({ id, defaultValues, onSuccess, editMode }: RoleFormProps) {
  const t = useTranslations();
  const { enterprise } = useUserStore();
  const enterpriseId = enterprise?.id as string;
  const { mutateAsync: createRole, isPending: isCreating } = useCreateRole();
  const { mutateAsync: updateRole, isPending: isUpdating } = useUpdateRole();
  const { data: permissions = [] } = usePermissions();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    Array.isArray(defaultValues?.permissions) ? defaultValues.permissions : [],
  );

  // Group permissions by category
  const permissionsByCategory = permissions.reduce<Record<string, Permission[]>>(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {},
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      permissions: defaultValues?.permissions || {},
    },
  });

  // Toggle permission selection
  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((current) => {
      if (current.includes(permissionId)) {
        return current.filter((id) => id !== permissionId);
      } else {
        return [...current, permissionId];
      }
    });
  };

  // Toggle all permissions in a category
  const toggleCategoryPermissions = (category: string) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    const allSelected = categoryPermissions.every((p) => selectedPermissions.includes(p.id));

    setSelectedPermissions((current) => {
      if (allSelected) {
        return current.filter((id) => !categoryPermissions.some((p) => p.id === id));
      } else {
        const toAdd = categoryPermissions.filter((p) => !current.includes(p.id)).map((p) => p.id);
        return [...current, ...toAdd];
      }
    });
  };

  const onSubmit = async (formData: FormData) => {
    try {
      if (editMode && id) {
        await updateRole({
          id,
          data: {
            ...formData,
            permissions: selectedPermissions,
            enterprise_id: enterpriseId,
          },
        });
      } else {
        await createRole({
          ...formData,
          permissions: selectedPermissions,
          enterprise_id: enterpriseId,
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting role form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Roles.form.name")}</FormLabel>
              <div className="flex gap-2">
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  disabled={editMode}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select predefined role" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Input {...field} placeholder="Or enter custom role name" disabled={editMode} />
                  {field.value && !/^[a-z0-9_]+$/.test(field.value) && (
                    <p className="text-destructive mt-1 text-xs">
                      Role name must contain only lowercase letters, numbers, and underscores
                    </p>
                  )}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field: { value, ...field } }) => (
            <FormItem>
              <FormLabel>{t("Roles.form.description")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={value || ""}
                  placeholder={t("Roles.form.description_placeholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Permissions</FormLabel>
          <PermissionsSection
            permissionsByCategory={permissionsByCategory}
            selectedPermissions={selectedPermissions}
            onPermissionChange={togglePermission}
            onCategoryToggle={toggleCategoryPermissions}
            isDisabled={editMode && defaultValues?.isSystem}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isCreating || isUpdating}>
            {editMode ? t("General.save") : t("General.create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
