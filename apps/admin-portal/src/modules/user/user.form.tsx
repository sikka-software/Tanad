import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";
import { Input } from "@/ui/inputs/input";
import PasswordInput from "@/ui/password-input";

import { ModuleFormProps } from "@/types/common.type";

import { RoleForm } from "@/role/role.form";
import { useCustomRoles, useSystemRoles } from "@/role/role.hooks";
import { predefinedRoles } from "@/role/role.options";
import useRoleStore from "@/role/role.store";
import type { Role } from "@/role/role.type";
import useUserStore from "@/stores/use-user-store";
import { useCreateUser, useUpdateUser } from "@/user/user.hooks";
import useEnterpriseUsersStore from "@/user/user.store";
import type { UserCreateData, UserUpdateData, UserType } from "@/user/user.type";

const createUserFormSchema = (t: (key: string) => string) => {
  const UserFormSchema = z.object({
    first_name: z.string().min(1, { message: t("Users.form.first_name.required") }),
    last_name: z.string().min(1, { message: t("Users.form.last_name.required") }),
    email: z.string().email({ message: t("Users.form.email.invalid") }),
    role: z.string().min(1, { message: t("Users.form.role.required") }),
    password: z.string().min(8, { message: t("Users.form.password.required") }),
  });
  return UserFormSchema;
};

// Password is optional for update, validation happens server-side if provided
// password: z
//   .string()
//   .min(8, { message: "Password must be at least 8 characters." })
//   .optional()
//   .or(z.literal("")),

// Infer the type from the base schema, specific validation handled conditionally
export type UserFormValues = z.input<ReturnType<typeof createUserFormSchema>>;

export function UserForm({ onSuccess, formHtmlId, defaultValues }: ModuleFormProps<UserType>) {
  const t = useTranslations();
  const locale = useLocale();
  const enterprise = useUserStore((state) => state.enterprise);
  const setIsLoading = useEnterpriseUsersStore((state) => state.setIsLoading);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false); // State for RoleForm dialog
  // Hooks for mutations
  const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();
  const setSavingRole = useRoleStore((state) => state.setIsLoading);
  const isSavingRole = useRoleStore((state) => state.isLoading);
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
    const combined = new Map<string, Role>();
    const rolesArray: Role[] = [];

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

  const isEditing = !!defaultValues;
  // const currentSchema = isEditing ? updateUserFormSchema : createUserFormSchema;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(createUserFormSchema(t)),
    defaultValues: useMemo(() => {
      // Revert to splitting full_name
      const [firstName = "", lastName = ""] = (defaultValues?.full_name || "").split(" ", 2);
      // Cannot reliably determine initial role name from initialData type
      return {
        first_name: firstName,
        last_name: lastName,
        email: defaultValues?.email || "",
        password: "",
        role: "", // Default role to empty string
      };
    }, [defaultValues?.id, defaultValues?.full_name, defaultValues?.email]), // Revert dependencies
  });

  // Reset form
  useEffect(() => {
    // Revert to splitting full_name
    const [firstName = "", lastName = ""] = (defaultValues?.full_name || "").split(" ", 2);

    form.reset({
      first_name: firstName,
      last_name: lastName,
      email: defaultValues?.email || "",
      password: "",
      role: "", // Default role to empty string
    });
    // Update dependencies to match defaultValues
  }, [
    defaultValues?.id,
    defaultValues?.full_name, // Revert dependencies
    defaultValues?.email,
    form.reset,
  ]);

  // Handler for RoleForm success
  const handleRoleCreated = useCallback(
    (newRole?: Role) => {
      setSavingRole(true);
      // Adjust type if needed
      // Close the dialog
      setIsRoleDialogOpen(false);
      // Refetch roles - React Query handles this via hook re-render if keys are correct
      toast.success(t("General.successful_operation"), {
        description: t("Roles.success.create"), // Use Role success message
      });
      // Cannot reliably set value without knowing the new role name from RoleForm onSuccess
      // if (newRole?.name) {
      //   form.setValue("role", newRole.name);
      // }
      setSavingRole(false);
    },
    [t, setIsRoleDialogOpen, form],
  );

  const onSubmit = async (values: UserFormValues) => {
    if (!enterprise?.id) {
      toast.error(t("Users.error.missing_enterprise"));
      return;
    }

    setIsLoading(true);

    // Find the role ID based on the selected role name
    const selectedRole = allRoles.roles.find((role) => role.name === values.role);
    const roleId = selectedRole?.id;

    // Construct mutation data based on form values
    // ** Combine first and last name into full_name **
    const fullName = `${values.first_name} ${values.last_name}`.trim();

    const mutationDataBase = {
      // Remove first_name and last_name
      full_name: fullName, // Add full_name
      email: values.email.toLowerCase(), // Ensure email is lowercase
      role: values.role, // Keep role name for API check
      enterprise_id: enterprise.id, // Keep for potential use (though API doesn't destructure it)
      role_id: roleId, // Keep role_id for potential use (though API doesn't destructure it)
    };

    // Add password conditionally
    const mutationData: UserCreateData | UserUpdateData = values.password
      ? { ...mutationDataBase, password: values.password }
      : mutationDataBase;

    try {
      if (isEditing && defaultValues) {
        await updateUser({
          id: defaultValues.id,
          data: { ...mutationData, role_id: roleId } as UserUpdateData,
        });
      } else {
        // Ensure password exists for creation, handled by schema but double-check
        if (!values.password) {
          toast.error(t("Validation.password_required"));
          setIsLoading(false);
          return;
        }
        await createUser({ ...mutationData, role_id: roleId } as UserCreateData);
      }
      // Reset form fields explicitly
      form.reset({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "", // Reset role to empty
      });
      onSuccess?.();
    } catch (error: any) {
      console.error("Submit Error in UserForm:", error);

      // Check for the specific 409 conflict error
      if (
        error?.response?.status === 409 &&
        error?.response?.data?.code === "USER_MEMBERSHIP_EXISTS"
      ) {
        // Set a specific error message on the email field
        form.setError("email", {
          type: "manual",
          message: t("Users.error.already_exists_in_enterprise"), // Add this translation key
        });
        toast.error(t("Validation.error"), {
          // More generic toast title
          description: t("Users.error.already_exists_in_enterprise"),
        });
      } else {
        // Handle other errors generally
        toast.error(t("General.error_occurred"), {
          description: error?.message || t(isEditing ? "Users.error.update" : "Users.error.create"),
        });
      }
      setIsLoading(false);
    }
  };

  // Use internal loading state
  const isFormSubmitting = isCreating || isUpdating;

  const roleOptions = useMemo(
    () =>
      allRoles.roles.map((role) => ({
        label: predefinedRoles(t, role.name)?.name || role.name, // Pass role.name to predefinedRoles
        value: role.name, // Form value
      })),
    [allRoles.roles],
  );

  return (
    <Form {...form}>
      {/* Use the correct form ID */}
      <form id={formHtmlId} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="form-container">
          <div className="form-fields-cols-2">
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
                    dir="ltr"
                    className="text-start"
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
                  <PasswordInput
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
              <FormItem className="flex flex-col">
                <FormLabel>{t("Users.form.role.label")}</FormLabel>
                <FormControl>
                  <ComboboxAdd
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    // Use role name as value, consistent with previous Select
                    data={roleOptions}
                    isLoading={rolesLoading}
                    defaultValue={field.value} // Current form value (role name)
                    onChange={(value) => field.onChange(value || null)} // Update form value
                    texts={{
                      placeholder: t("Users.form.role.placeholder"),
                      searchPlaceholder: t("Pages.Roles.search"),
                      noItems: t("Pages.Roles.no_roles_available"),
                    }}
                    addText={t("Pages.Roles.add")} // Use Role translation
                    onAddClick={() => setIsRoleDialogOpen(true)} // Open dialog
                    disabled={isFormSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>

      <FormDialog
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        title={t("Pages.Roles.add")}
        formId="role-form"
        cancelText={t("General.cancel")}
        submitText={t("General.save")}
        loadingSave={isSavingRole}
      >
        <RoleForm formHtmlId="role-form" onSuccess={handleRoleCreated} nestedForm />
      </FormDialog>
    </Form>
  );
}
