import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
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
import { createClient } from "@/utils/supabase/component";

import { useRoles } from "../role/role.hooks";
import type { Role } from "../role/role.type";
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
  onSuccess: () => void; // Callback to close the dialog/form
  id?: string;
}

export function UserForm({ onSuccess, id }: UserFormProps) {
  const t = useTranslations();
  const profile = useUserStore((state) => state.profile);
  const createUser = useCreateUser();
  const { data: roles, isLoading: rolesLoading, error: rolesError } = useRoles(profile?.enterprise_id);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (roles && roles.length > 0) {
      const currentRoleValue = form.getValues("role");
      const isValidRole = roles.some((role: Role) => role.name === currentRoleValue);
      if (!isValidRole && currentRoleValue) {
        form.setValue("role", "");
      }
    }
  }, [roles, form]);

  const onSubmit = async (values: UserFormData) => {
    if (!profile?.enterprise_id) {
      toast.error("Cannot create user: Enterprise information missing.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createUser.mutateAsync({
        email: values.email,
        role: values.role,
        enterprise_id: profile.enterprise_id,
      });
      toast.success(t("General.successful_operation"), {
        description: t("Users.messages.created"),
      });
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
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
                      Error loading roles
                    </SelectItem>
                  ) : roles && roles.length > 0 ? (
                    roles.map((role: Role) => (
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
