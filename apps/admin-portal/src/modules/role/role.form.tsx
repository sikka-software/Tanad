import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

import useUserStore from "@/stores/use-user-store";

import { usePermissions } from "../permission/permission.hooks";
import { useCreateRole, useUpdateRole } from "./role.hooks";
import type { RoleCreateData, RoleUpdateData } from "./role.type";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[a-z0-9_]+$/, {
      message: "Role name must contain only lowercase letters, numbers, and underscores",
    }),
  description: z.string().nullable(),
  permissions: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

interface RoleFormProps {
  id?: string;
  defaultValues?: {
    name: string;
    description: string | null;
    permissions: string[];
  };
  onSuccess?: () => void;
  editMode?: boolean;
}

export function RoleForm({ id, defaultValues, onSuccess, editMode }: RoleFormProps) {
  const t = useTranslations();
  const { enterprise } = useUserStore();
  const enterpriseId = enterprise?.id as string;
  const { mutateAsync: createRole, isPending: isCreating } = useCreateRole();
  const { mutateAsync: updateRole, isPending: isUpdating } = useUpdateRole();
  const { data: permissions = [] } = usePermissions();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    defaultValues?.permissions || [],
  );

  // Group permissions by category
  const permissionsByCategory = permissions.reduce<Record<string, { id: string; name: string }[]>>(
    (acc, permission) => {
      const category = permission.name.split('.')[0];
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    },
    {},
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || null,
      permissions: defaultValues?.permissions || [],
    },
  });

  // Toggle permission selection
  const togglePermission = (permission: string) => {
    setSelectedPermissions((current) => {
      if (current.includes(permission)) {
        return current.filter((p) => p !== permission);
      } else {
        return [...current, permission];
      }
    });
  };

  // Toggle all permissions in a category
  const toggleCategoryPermissions = (category: string) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    const allSelected = categoryPermissions.every((p) => selectedPermissions.includes(p.name));

    setSelectedPermissions((current) => {
      if (allSelected) {
        return current.filter((p) => !categoryPermissions.some((cp) => cp.name === p));
      } else {
        const toAdd = categoryPermissions
          .filter((p) => !current.includes(p.name))
          .map((p) => p.name);
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
            name: formData.name,
            description: formData.description,
            permissions: selectedPermissions,
            enterprise_id: enterpriseId,
          },
        });
      } else {
        await createRole({
          name: formData.name,
          description: formData.description,
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
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={t("Roles.form.name_placeholder")}
                  disabled={editMode}
                />
              </FormControl>
              {field.value && !/^[a-z0-9_]+$/.test(field.value) && (
                <p className="text-destructive mt-1 text-xs">
                  {t("Roles.form.name_format")}
                </p>
              )}
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
          <ScrollArea className="h-[300px] pe-4">
            <Accordion type="multiple" className="w-full">
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="py-2">
                    <div className="flex w-full items-center justify-between pe-4">
                      <span>{category}</span>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={perms.every((p) => selectedPermissions.includes(p.name))}
                          onCheckedChange={() => toggleCategoryPermissions(category)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-muted-foreground text-xs">
                          {perms.filter((p) => selectedPermissions.includes(p.name)).length}/
                          {perms.length}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 ps-4 pt-2">
                      {perms.map((permission) => (
                        <div key={permission.name} className="flex items-start space-x-2">
                          <Checkbox
                            id={`permission-${permission.name}`}
                            checked={selectedPermissions.includes(permission.name)}
                            onCheckedChange={() => togglePermission(permission.name)}
                          />
                          <div className="space-y-1">
                            <label
                              htmlFor={`permission-${permission.name}`}
                              className="font-medium"
                            >
                              {permission.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
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
