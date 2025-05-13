import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type React from "react";

export type EnterpriseFormValues = {
  name: string;
  industry?: string;
  founded?: string;
  employees?: string;
  website?: string;
  email?: string;
  phone?: string;
  logo?: string;
  address?: string;
  description?: string;
};

interface EnterpriseFormProps {
  defaultValues: EnterpriseFormValues;
  readOnly?: boolean;
  loading?: boolean;
  onSubmit: (values: EnterpriseFormValues) => void;
  onCancel: () => void;
}

export const EnterpriseForm: React.FC<EnterpriseFormProps> = ({
  defaultValues,
  readOnly = false,
  loading = false,
  onSubmit,
  onCancel,
}) => {
  const { register, handleSubmit, formState } = useForm<EnterpriseFormValues>({
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Enterprise Name</Label>
          <Input
            readOnly={readOnly}
            id="name"
            {...register("name", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            readOnly={readOnly}
            id="industry"
            {...register("industry")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="founded">Founded</Label>
          <Input
            readOnly={readOnly}
            id="founded"
            {...register("founded")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employees">Number of Employees</Label>
          <Input
            readOnly={readOnly}
            id="employees"
            {...register("employees")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            readOnly={readOnly}
            id="website"
            {...register("website")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            readOnly={readOnly}
            id="email"
            {...register("email")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            readOnly={readOnly}
            id="phone"
            {...register("phone")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo">Logo URL</Label>
          <Input
            readOnly={readOnly}
            id="logo"
            {...register("logo")}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          readOnly={readOnly}
          id="address"
          {...register("address")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          readOnly={readOnly}
          id="description"
          {...register("description")}
          rows={4}
        />
      </div>
      {!readOnly && (
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      )}
    </form>
  );
};
