import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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
import { Textarea } from "@/components/ui/textarea";

import useUserStore from "@/stores/use-user-store";

import { useUser } from "../user/user.hooks";
import { useCreateRole, useUpdateRole } from "./role.hooks";
import type { RoleCreateData, RoleUpdateData } from "./role.type";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  permissions: z.record(z.string(), z.boolean()),
});

type FormData = z.infer<typeof formSchema>;

interface RoleFormProps {
  id?: string;
  defaultValues?: RoleUpdateData;
  onSuccess?: () => void;
  editMode?: boolean;
}

export function RoleForm({ id, defaultValues, onSuccess, editMode }: RoleFormProps) {
  const t = useTranslations();
  const { enterprise } = useUserStore();
  const enterpriseId = enterprise?.id as string;
  const { mutateAsync: createRole, isPending: isCreating } = useCreateRole();
  const { mutateAsync: updateRole, isPending: isUpdating } = useUpdateRole();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || null,
      permissions: defaultValues?.permissions || {},
    },
  });

  const onSubmit = async (formData: FormData) => {
    try {
      if (editMode && id) {
        await updateRole({ id, data: formData });
      } else {
        const data: RoleCreateData = {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
          enterprise_id: enterpriseId,
        };
        await createRole(data);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting role form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Roles.form.name")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
                <Textarea {...field} value={value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isCreating || isUpdating}>
            {editMode ? t("General.save") : t("General.create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
