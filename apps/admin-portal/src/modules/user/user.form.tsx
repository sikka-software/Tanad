import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

import useUserStore from "@/stores/use-user-store";

// Import store for loading state

import { useCustomRoles, useSystemRoles } from "../role/role.hooks";
import type { Role, RoleWithPermissions } from "../role/role.type";
// Import hooks for create/update
import { useCreateUser, useUpdateUser } from "./user.hooks";
import useEnterpriseUsersStore from "./user.store";
// Add User type
import type { UserType } from "./user.table";
import type { UserCreateData, UserUpdateData, User } from "./user.type";

// Adjust schema: make password optional for updates
const baseUserFormSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required." }),
  last_name: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.string().min(1, { message: "Role is required." }),
});

const createUserFormSchema = baseUserFormSchema.extend({
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

const updateUserFormSchema = baseUserFormSchema.extend({
  // Password is optional for update, validation happens server-side if provided
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .optional()
    .or(z.literal("")),
});

// Infer the type from the base schema, specific validation handled conditionally
type UserFormData = z.infer<typeof baseUserFormSchema> & { password?: string };

interface UserFormProps {
  onSuccess: () => void;
  id?: string;
  // Revert to User type, assuming it has first_name, last_name, and role (ID/key)
  initialData?: User | null;
}

export function UserForm({ onSuccess, id, initialData }: UserFormProps) {
  const t = useTranslations();
  const enterprise = useUserStore((state) => state.enterprise);
  const setLoadingSaveUser = useEnterpriseUsersStore((state) => state.setIsLoading); // Use store action

  // Hooks for mutations
  const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

  // State for roles
  const {
    data: customRoles,
    isLoading: customRolesLoading,
    error: customRolesError,
  } = useCustomRoles();
  const {
    data: systemRoles,
    isLoading: systemRolesLoading,
    error: systemRolesError,
  } = useSystemRoles();

  // Process roles, don't rely on initialData for role
  const allRoles = useMemo(() => {
    const combined = new Map<string, RoleWithPermissions>();
    const rolesArray: RoleWithPermissions[] = [];

    (customRoles ?? []).forEach((role) => {
      if (!combined.has(role.id)) {
        combined.set(role.id, role);
        rolesArray.push(role);
      }
    });
    (systemRoles ?? []).forEach((role) => {
      if (!combined.has(role.id)) {
        combined.set(role.id, role);
        rolesArray.push(role);
      }
    });

    rolesArray.sort((a, b) => a.name.localeCompare(b.name));

    return {
      roles: rolesArray,
      // Cannot determine initial role name from the provided initialData type
      initialRoleName: "",
    };
    // Remove initialData dependency as we don't use its role
  }, [customRoles, systemRoles]);

  const rolesLoading = customRolesLoading || systemRolesLoading;
  const rolesError = customRolesError || systemRolesError;

  const isEditing = !!initialData;
  const currentSchema = isEditing ? updateUserFormSchema : createUserFormSchema;

  const form = useForm<UserFormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: useMemo(
      () => {
        // Use full_name as it's available according to TS error
        const [firstName = "", lastName = ""] = (initialData?.full_name || "").split(" ", 2); // Split only once
        return {
          first_name: firstName,
          last_name: lastName,
          email: initialData?.email || "",
          password: "",
          // Default role will be empty string
          role: allRoles.initialRoleName,
        };
      },
      // Depend only on properties known to exist on initialData and roles
      [initialData?.id, initialData?.full_name, initialData?.email, allRoles.initialRoleName],
    ),
  });

  // Reset form
  useEffect(() => {
    const [firstName = "", lastName = ""] = (initialData?.full_name || "").split(" ", 2);
    form.reset({
      first_name: firstName,
      last_name: lastName,
      email: initialData?.email || "",
      password: "",
      role: allRoles.initialRoleName, // Keep reset consistent
    });
    // Update dependencies to match defaultValues
  }, [
    initialData?.id,
    initialData?.full_name,
    initialData?.email,
    allRoles.initialRoleName,
    form.reset,
  ]);

  const onSubmit = async (values: UserFormData) => {
    if (!enterprise?.id) {
      toast.error(t("Users.error.missing_enterprise"));
      return;
    }

    setLoadingSaveUser(true);

    // Construct mutation data based on form values
    const mutationDataBase = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      role: values.role,
      enterprise_id: enterprise.id,
    };

    // Add password conditionally
    const mutationData: UserCreateData | UserUpdateData = values.password
      ? { ...mutationDataBase, password: values.password }
      : mutationDataBase;

    try {
      if (isEditing && initialData) {
        await updateUser({ id: initialData.id, data: mutationData as UserUpdateData });
        toast.success(t("General.successful_operation"), {
          description: t("Users.success.updated"),
        });
      } else {
        // Ensure password exists for creation, handled by schema but double-check
        if (!values.password) {
          toast.error(t("Validation.password_required"));
          setLoadingSaveUser(false);
          return;
        }
        await createUser(mutationData as UserCreateData);
        toast.success(t("General.successful_operation"), {
          description: t("Users.success.created"),
        });
      }
      // Reset form fields explicitly
      form.reset({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "", // Reset role to empty
      });
      onSuccess();
    } catch (error: any) {
      console.error("Submit Error in UserForm:", error);
      toast.error(t("General.error_occurred"), {
        description:
          error?.message || t(isEditing ? "Users.error.updating" : "Users.error.creating"),
      });
    } finally {
      setLoadingSaveUser(false);
    }
  };

  // Use internal loading state
  const isFormSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      {/* Use the correct form ID */}
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Users.form.first_name.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Users.form.first_name.placeholder")}
                    {...field}
                    disabled={isFormSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Users.form.last_name.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Users.form.last_name.placeholder")}
                    {...field}
                    disabled={isFormSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Users.form.email.label")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("Users.form.email.placeholder")}
                  {...field}
                  disabled={isFormSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("Users.form.password.label")}{" "}
                {isEditing && (
                  <span className="text-muted-foreground text-xs">
                    {" "}
                    ({t("Users.password_optional")})
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("Users.form.password.placeholder")}
                  {...field}
                  disabled={isFormSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Users.form.role.label")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value} // This should be the role name
                disabled={rolesLoading || isFormSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Users.form.role.placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rolesLoading ? (
                    <SelectItem value="loading" disabled>
                      {t("General.loading")}
                    </SelectItem>
                  ) : rolesError ? (
                    <SelectItem value="error" disabled>
                      {t("General.error_loading")}
                    </SelectItem>
                  ) : allRoles.roles.length > 0 ? (
                    allRoles.roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {" "}
                        {/* Value is role name */}
                        {role.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-roles" disabled>
                      {t("Roles.no_roles_available")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
