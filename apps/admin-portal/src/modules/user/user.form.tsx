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

import { useCustomRoles, useSystemRoles } from "../role/role.hooks";
import type { Role, RoleWithPermissions } from "../role/role.type";
import type { UserCreateData } from "./user.type";
import type { UserType } from "./user.table";

// Define the Zod schema for form validation
const userFormSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required." }),
  last_name: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  role: z.string().min(1, { message: "Role is required." }),
});

// Infer the type from the schema
type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  onSuccess: () => void;
  id?: string;
  onSubmitRequest: (data: UserCreateData) => Promise<void>;
  isSubmitting: boolean;
}

export function UserForm({ onSuccess, id, onSubmitRequest, isSubmitting }: UserFormProps) {
  const t = useTranslations();
  const profile = useUserStore((state) => state.profile);
  const enterprise = useUserStore((state) => state.enterprise);

  // Reinstated hook calls:
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

  const allRoles = useMemo(() => {
    const combined = new Map<string, RoleWithPermissions>();
    (customRoles ?? []).forEach((role) => combined.set(role.id, role));
    (systemRoles ?? []).forEach((role) => {
      if (!combined.has(role.id)) {
        combined.set(role.id, role);
      }
    });
    return Array.from(combined.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [customRoles, systemRoles]);

  const rolesLoading = customRolesLoading || systemRolesLoading;
  const rolesError = customRolesError || systemRolesError;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "",
    },
  });

  useEffect(() => {
    if (!rolesLoading && allRoles.length > 0) {
      const currentSelectedRoleName = form.getValues("role");
      if (currentSelectedRoleName) {
        const isValidRole = allRoles.some((role) => role.name === currentSelectedRoleName);
        if (!isValidRole) {
          console.log(
            "Resetting role because current selection is invalid:",
            currentSelectedRoleName,
          );
          // form.resetField("role", { defaultValue: "" }); // Temporarily comment out
        }
      }
    }
  }, [allRoles, rolesLoading]); // Keep dependencies minimal

  const onSubmit = async (values: UserFormData) => {
    if (!enterprise?.id) { // Restore check
      toast.error("Cannot create user: Enterprise information missing.");
      return;
    }

    try {
      await onSubmitRequest({
        email: values.email,
        role: values.role,
        enterprise_id: enterprise.id, // Restore using enterprise.id
        first_name: values.first_name,
        last_name: values.last_name,
        password: values.password,
      });
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Submit Error in UserForm when calling onSubmitRequest:", error);
    }
  };

  const isFormSubmitting = isSubmitting;

  return (
    <Form {...form}>
      <form id={id || "user-form"} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} disabled={isFormSubmitting} />
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
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} disabled={isFormSubmitting} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="user@example.com"
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="********"
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
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={rolesLoading || isFormSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rolesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading roles...
                    </SelectItem>
                  ) : rolesError ? (
                    <SelectItem value="error" disabled>
                      Error loading roles
                    </SelectItem>
                  ) : allRoles.length > 0 ? (
                    allRoles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-roles" disabled>
                      No roles available
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
