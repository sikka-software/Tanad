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
// Assuming Permission type looks like { id: string; name: string }
// import type { Permission } from "../permission/permission.type";
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
  formId?: string;
}

export function RoleForm({ id, defaultValues, onSuccess, editMode, formId }: RoleFormProps) {
  const t = useTranslations();
  const { enterprise } = useUserStore();
  const enterpriseId = enterprise?.id;
  const { mutateAsync: createRole, isPending: isCreating } = useCreateRole();
  const { mutateAsync: updateRole, isPending: isUpdating } = useUpdateRole();
  const { data: permissions = [] } = usePermissions();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    defaultValues?.permissions || [],
  );

  // Group permissions by inferred module (last word of the name)
  const permissionsByCategory = permissions.reduce<
    Record<string, Array<(typeof permissions)[number]>> // Infer type from permissions array
  >((acc, permission) => {
    const nameParts = permission.name.trim().split(" ");
    // Use the last word as the category/module key
    const categoryKey = nameParts.length > 1 ? nameParts[nameParts.length - 1] : permission.name;
    // Capitalize the first letter for display
    const displayCategory = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);

    if (!acc[displayCategory]) {
      acc[displayCategory] = [];
    }
    acc[displayCategory].push(permission);
    return acc;
  }, {});

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
        // Filter out permissions belonging to this category
        return current.filter((pName) => !categoryPermissions.some((cp) => cp.name === pName));
      } else {
        // Add permissions from this category that are not already selected
        const toAdd = categoryPermissions
          .filter((p) => !current.includes(p.name))
          .map((p) => p.name);
        return [...current, ...toAdd];
      }
    });
  };

  const onSubmit = async (formData: FormData) => {
    try {
      if (editMode && id) { // Ensure id exists for edit mode
        await updateRole({
          id: id,
          data: {
            name: formData.name,
            description: formData.description,
            permissions: selectedPermissions,
            // Note: enterprise_id cannot be updated for a role
          },
        });
      } else if (!editMode && enterpriseId) { // Ensure enterpriseId exists for create mode
        await createRole({
          name: formData.name,
          description: formData.description,
          permissions: selectedPermissions,
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
    }
  };

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Roles.form.name.label")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Roles.form.name_placeholder")}
                  disabled={editMode}
                />
              </FormControl>
              {field.value && !/^[a-z0-9_]+$/.test(field.value) && (
                <p className="text-destructive mt-1 text-xs">{t("Roles.form.name_format")}</p>
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
          <ScrollArea className="h-[300px] pe-4">
            <Accordion type="multiple" className="w-full">
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="py-2">
                    <div className="flex w-full items-center justify-between pe-4">
                      {/* Display the capitalized category name */}
                      <span>{category}</span>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          // Check if all permissions in this category are selected by name
                          checked={perms.every((p) => selectedPermissions.includes(p.name))}
                          onCheckedChange={() => toggleCategoryPermissions(category)} // Still pass category name
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-muted-foreground text-xs">
                          {/* Count selected permissions in this category by name */}
                          {perms.filter((p) => selectedPermissions.includes(p.name)).length}/
                          {perms.length}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 ps-4 pt-2">
                      {perms.map((permission) => {
                        // Extract action part (e.g., "Read" from "Read expenses")
                        const nameParts = permission.name.trim().split(" ");
                        const actionName =
                          nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : permission.name;

                        return (
                          <div key={permission.id} className="flex items-start space-x-2">
                            {" "}
                            {/* Use id for key */}
                            <Checkbox
                              // Use unique id for the checkbox element
                              id={`permission-${permission.id}`}
                              // Check selection state using the full name
                              checked={selectedPermissions.includes(permission.name)}
                              // Toggle selection state using the full name
                              onCheckedChange={() => togglePermission(permission.name)}
                            />
                            <div className="space-y-1">
                              <label
                                htmlFor={`permission-${permission.id}`} // Match checkbox id
                                className="cursor-pointer font-medium" // Add cursor-pointer
                              >
                                {/* Display only the action part */}
                                {actionName}
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </div>
      </form>
    </Form>
  );
}
