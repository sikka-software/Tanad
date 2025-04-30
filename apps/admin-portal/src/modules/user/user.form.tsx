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

import { useRoles, useSystemRoles } from "../role/role.hooks";
import type { Role, RoleWithPermissions } from "../role/role.type";
import { useCreateUser } from "./user.hooks";
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
}

export function UserForm({ onSuccess, id }: UserFormProps) {
  const t = useTranslations();
  const { profile, enterprise } = useUserStore((state) => ({
    profile: state.profile,
    enterprise: state.enterprise,
  }));
  const createUser = useCreateUser();
  const {
    data: enterpriseRoles,
    isLoading: enterpriseRolesLoading,
    error: enterpriseRolesError,
  } = useRoles();
  const {
    data: systemRoles,
    isLoading: systemRolesLoading,
    error: systemRolesError,
  } = useSystemRoles();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const allRoles = useMemo(() => {
    const combined = new Map<string, RoleWithPermissions>();
    (enterpriseRoles || []).forEach((role) => combined.set(role.id, role));
    (systemRoles || []).forEach((role) => {
      if (!combined.has(role.id)) {
        combined.set(role.id, role);
      }
    });
    return Array.from(combined.values());
  }, [enterpriseRoles, systemRoles]);

  const rolesLoading = enterpriseRolesLoading || systemRolesLoading;
  const rolesError = enterpriseRolesError || systemRolesError;

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

  const currentRoleValue = form.watch("role");

  useEffect(() => {
    if (allRoles && allRoles.length > 0 && currentRoleValue) {
      const isValidRole = allRoles.some((role) => role.name === currentRoleValue);
      if (!isValidRole) {
        form.setValue("role", "");
      }
    }
  }, [allRoles, currentRoleValue, form.setValue]);

  const onSubmit = async (values: UserFormData) => {
    if (!enterprise?.id) {
      toast.error("Cannot create user: Enterprise information missing.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createUser.mutateAsync({
        email: values.email,
        role: values.role,
        enterprise_id: enterprise.id,
        first_name: values.first_name,
        last_name: values.last_name,
        password: values.password,
      });
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Submit Error in form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <Input placeholder="John" {...field} disabled={isSubmitting} />
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
                  <Input placeholder="Doe" {...field} disabled={isSubmitting} />
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
                  disabled={isSubmitting}
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
                <Input type="password" placeholder="********" {...field} disabled={isSubmitting} />
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
                disabled={rolesLoading || !!rolesError || isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={rolesLoading ? "Loading roles..." : "Select a role"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rolesError ? (
                    <SelectItem value="error" disabled>
                      Error: {rolesError.message}
                    </SelectItem>
                  ) : allRoles && allRoles.length > 0 ? (
                    allRoles.map((role: Role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      {rolesLoading ? "Loading..." : "No roles available"}
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
