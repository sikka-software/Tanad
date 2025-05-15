import { Loader2 } from "lucide-react";
import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createClient } from "@/utils/supabase/component";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type EnterpriseFormValues = {
  id?: string;
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
  formId: string;
}

export const EnterpriseForm: React.FC<EnterpriseFormProps> = ({
  defaultValues,
  readOnly = false,
  loading = false,
  onSubmit,
  onCancel,
  formId,
}) => {
  const { register, handleSubmit, setValue, watch, formState } = useForm<EnterpriseFormValues>({
    defaultValues,
  });
  const [uploading, setUploading] = useState(false);

  // Watch for logo value to show preview
  const logoPath = watch("logo");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  // Generate signed URL for preview when logoPath changes
  React.useEffect(() => {
    async function getSignedUrl() {
      if (logoPath) {
        const supabase = createClient();
        const { data, error } = await supabase.storage
          .from("enterprise-images")
          .createSignedUrl(logoPath, 60 * 60); // 1 hour
        if (data?.signedUrl) {
          setLogoPreviewUrl(data.signedUrl);
        } else {
          setLogoPreviewUrl(null);
        }
      } else {
        setLogoPreviewUrl(null);
      }
    }
    getSignedUrl();
  }, [logoPath]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      // Use enterprise id if available, fallback to 'unknown'
      const enterpriseId = defaultValues.id || "unknown";
      const fileExt = file.name.split(".").pop();
      const fileName = `logos/${enterpriseId}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("enterprise-images")
        .upload(fileName, file);
      if (error) throw error;
      // Store only the file path
      setValue("logo", fileName, { shouldValidate: true });
    } catch (err) {
      alert("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Enterprise Name</Label>
          <Input readOnly={readOnly} id="name" {...register("name", { required: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input readOnly={readOnly} id="industry" {...register("industry")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="founded">Founded</Label>
          <Input readOnly={readOnly} id="founded" {...register("founded")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employees">Number of Employees</Label>
          <Input readOnly={readOnly} id="employees" {...register("employees")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input readOnly={readOnly} id="website" {...register("website")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input readOnly={readOnly} id="email" {...register("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input readOnly={readOnly} id="phone" {...register("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo">Logo</Label>
          {logoPreviewUrl && (
            <img
              src={logoPreviewUrl}
              alt="Enterprise Logo"
              className="mb-2 h-16 w-16 rounded-md border object-contain"
            />
          )}
          {!readOnly && (
            <Input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploading}
            />
          )}
          <Input readOnly={true} id="logo" value={logoPath || ""} {...register("logo")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input readOnly={readOnly} id="address" {...register("address")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea readOnly={readOnly} id="description" {...register("description")} rows={4} />
      </div>
    </form>
  );
};
