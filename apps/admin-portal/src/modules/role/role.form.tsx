import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion";
import { Checkbox } from "@/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/inputs/input";
import { ScrollArea } from "@/ui/scroll-area";
import { Textarea } from "@/ui/textarea";

import { convertToPascalCase } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { usePermissions } from "../permission/permission.hooks";
import type { Permission } from "../permission/permission.hooks";
import { useCreateRole, useUpdateRole } from "./role.hooks";
import useRoleStore from "./role.store";
import { RoleCreateData, RoleUpdateData } from "./role.type";

const createRoleSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("Roles.form.name.required"))
      .regex(/^[a-z0-9_]+$/, {
        message: "Role name must contain only lowercase letters, numbers, and underscores",
      }),
    description: z.string().nullable(),
    permissions: z.array(z.string()),
  });

type FormData = z.input<ReturnType<typeof createRoleSchema>>;

export function RoleForm({
  formHtmlId,
  defaultValues,
  onSuccess,
  editMode,
}: ModuleFormProps<RoleUpdateData | RoleCreateData>) {
  const t = useTranslations();
  const locale = useLocale();
  const enterprise = useUserStore((state) => state.enterprise);
  const enterpriseId = enterprise?.id;
  const { mutateAsync: createRole, isPending: isCreating } = useCreateRole();
  const { mutateAsync: updateRole, isPending: isUpdating } = useUpdateRole();
  const { data: permissions = [] } = usePermissions();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    defaultValues?.permissions || [],
  );
  const isLoading = useRoleStore((state) => state.isLoading);
  const setIsLoading = useRoleStore((state) => state.setIsLoading);
  const skippedCategories = ["settings"];
  const skippedPermissions = ["activity_logs.delete"];

  // Group permissions by resource (first part of 'resource.action' from permission.id)
  const permissionsByCategory = permissions.reduce<
    Record<string, Array<Permission>> // Use the imported Permission type
  >((acc, permission) => {
    let moduleName = convertToPascalCase(permission.id.split(".")[0]);

    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    if (skippedPermissions.includes(permission.id)) {
      return acc;
    }
    // Push the *entire permission object*
    acc[moduleName].push(permission);
    return acc;
  }, {});

  const form = useForm<FormData>({
    resolver: zodResolver(createRoleSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || null,
      permissions: [], // form field itself is not directly used for permission state
    },
  });

  // Toggle permission selection (expects permission id in resource.action format)
  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((current) => {
      if (current.includes(permissionId)) {
        return current.filter((p) => p !== permissionId);
      } else {
        return [...current, permissionId];
      }
    });
  };

  // Toggle all permissions in a category (expects display category name)
  const toggleCategoryPermissions = (category: string) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    // Check selection status based on permission.id (resource.action string)
    const allSelected = categoryPermissions.every((p) => selectedPermissions.includes(p.id));

    setSelectedPermissions((current) => {
      if (allSelected) {
        // Filter out permissions belonging to this category (using permission.id)
        return current.filter((pId) => !categoryPermissions.some((cp) => cp.id === pId));
      } else {
        // Add permissions from this category that are not already selected (using permission.id)
        const toAdd = categoryPermissions.filter((p) => !current.includes(p.id)).map((p) => p.id); // Add the resource.action string (permission.id)
        return [...current, ...toAdd];
      }
    });
  };

  const onSubmit = async (formData: FormData) => {
    // Directly use the selectedPermissions state which holds the correct format
    const permissionsToSubmit = selectedPermissions;

    try {
      setIsLoading(true);
      if (editMode && defaultValues?.id) {
        // Ensure id exists for edit mode
        await updateRole({
          id: defaultValues?.id,
          data: {
            name: formData.name,
            description: formData.description,
            permissions: permissionsToSubmit, // Submit correct format
            // Note: enterprise_id cannot be updated for a role
          },
        });
      } else if (!editMode && enterpriseId) {
        // Ensure enterpriseId exists for create mode
        await createRole({
          name: formData.name,
          description: formData.description,
          permissions: permissionsToSubmit, // Submit correct format
          enterprise_id: enterpriseId, // Pass enterpriseId
        });
      } else {
        // Handle missing id for edit or missing enterpriseId for create
        console.error("Missing ID for edit mode or Enterprise ID for create mode");
        // Optionally show an error toast to the user
        return; // Prevent submission
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting role form:", error);
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form id={formHtmlId} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="form-container">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Roles.form.name.label")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("Roles.form.name.placeholder")}
                    disabled={editMode}
                  />
                </FormControl>
                {field.value && !/^[a-z0-9_]+$/.test(field.value) && (
                  <p className="text-destructive mt-1 text-xs">{t("Roles.form.name.format")}</p>
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
                <FormLabel>{t("Roles.form.description.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={value || ""}
                    placeholder={t("Roles.form.description.placeholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>{t("Roles.form.permissions.label")}</FormLabel>
            <ScrollArea className="h-[300px] pe-4" dir={locale === "ar" ? "rtl" : "ltr"}>
              <Accordion type="multiple" className="w-full">
                {Object.entries(permissionsByCategory).map(([category, perms]) =>
                  skippedCategories.includes(category.toLowerCase()) ? null : (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="py-2">
                        <div className="flex w-full items-center justify-between pe-4">
                          <span>{t(`Pages.${category}.title`)}</span>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={perms.every((p) => selectedPermissions.includes(p.id))}
                              onCheckedChange={() => toggleCategoryPermissions(category)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-muted-foreground text-xs">
                              {perms.filter((p) => selectedPermissions.includes(p.id)).length}/
                              {perms.length}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 ps-4 pt-2">
                          {perms.map((permission) => {
                            // Extract action part (e.g., "create" from "companies.create")
                            const nameParts = permission.id.split("."); // Split permission.id
                            const actionName = nameParts.length > 1 ? nameParts[1] : permission.id;
                            // Capitalize action for display
                            const displayActionName =
                              actionName.charAt(0).toUpperCase() + actionName.slice(1);

                            return (
                              <div key={permission.id} className="flex items-start space-x-2">
                                <Checkbox
                                  // Check based on resource.action string (permission.id)
                                  checked={selectedPermissions.includes(permission.id)}
                                  // Pass resource.action string (permission.id)
                                  onCheckedChange={() => togglePermission(permission.id)}
                                  id={`permission-${permission.id}`} // Unique ID for the checkbox using the action string
                                />
                                <label
                                  htmlFor={`permission-${permission.id}`} // Associate label with checkbox
                                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {/* Display the capitalized action name (e.g., Create, Read) */}
                                  {t(`Roles.permissions.${displayActionName.toLowerCase()}`)}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ),
                )}
              </Accordion>
            </ScrollArea>
          </div>
        </div>
      </form>
    </Form>
  );
}
