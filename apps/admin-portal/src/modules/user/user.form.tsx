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

// Or define Profile type in user.type.ts
import { useRoles } from "../role/role.hooks";
import type { Role } from "../role/role.service";
import { useCreateUser } from "./user.hooks";
import type { UserType } from "./user.table";

// Import Role type

// Define the Zod schema for form validation
const userFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  // role: z.enum(["accounting", "hr"]), // Changed from enum
  role: z.string().min(1, { message: "Role is required." }), // General string validation
});

// Infer the type from the schema
type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  currentUser: UserType; // Need this to get the enterprise_id
  onSuccess: () => void; // Callback to close the dialog/form
}

export function UserForm({ currentUser, onSuccess }: UserFormProps) {
  const t = useTranslations();
  const createUser = useCreateUser();
  const { data: roles, isLoading: rolesLoading, error: rolesError } = useRoles(); // Fetch roles
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "", // Default role empty, user must select
    },
  });

  // Reset role if available roles change and current value is invalid
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
    if (!currentUser?.enterprise_id) {
      toast.error("Cannot create user: Enterprise information missing.");
      console.error("Current user enterprise_id is missing", currentUser);
      return;
    }

    setIsSubmitting(true);
    try {
      await createUser.mutateAsync({
        ...values,
        enterprise_id: currentUser.enterprise_id,
      });
      toast.success(t("General.successful_operation"), {
        description: t("Users.messages.created"),
      });
      form.reset(); // Reset form fields
      onSuccess(); // Call the success callback (e.g., close dialog)
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
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
                <Input placeholder="user@example.com" {...field} />
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
                <Input type="password" placeholder="********" {...field} />
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
                disabled={rolesLoading || !!rolesError}
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
        {/* Enterprise field removed - automatically assigned */}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting || rolesLoading || !!rolesError}>
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
