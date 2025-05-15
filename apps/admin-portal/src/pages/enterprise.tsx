"use client";

import { pick } from "lodash";
import { Asterisk, Edit, Loader2 } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import React from "react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { EnterpriseForm, EnterpriseFormValues } from "@/modules/enterprise/enterprise.form";
import useUserStore from "@/stores/use-user-store";

const EnterprisePage = () => {
  const t = useTranslations();

  const enterprise = useUserStore((state) => state.enterprise);
  const setEnterprise = useUserStore((state) => state.setEnterprise);

  if (!enterprise) {
    return <div>Loading enterprise details...</div>;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [enterpriseData, setEnterpriseData] = useState(enterprise);
  const [formData, setFormData] = useState(enterprise);
  const [isSaving, setIsSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/enterprise", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: enterprise.id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update enterprise");
      }
      const updated = await response.json();
      setEnterpriseData(updated);
      setFormData(updated);
      setIsEditing(false);
      toast.success("Enterprise information updated", {
        description: "The enterprise information has been successfully updated.",
      });
    } catch (err: any) {
      toast.error("Failed to update enterprise", {
        description: err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(enterpriseData);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="mx-auto flex flex-col gap-4 p-4">
        <div className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-4">
            {enterprise.logo ? (
              <img
                src={enterprise.logo}
                alt={`${enterpriseData.name} logo`}
                className="h-16 w-16 rounded-md border object-contain"
              />
            ) : (
              <Asterisk className="h-16 w-16 rounded-md border object-contain p-2" />
            )}
            <div>
              <CardTitle>{enterpriseData.name}</CardTitle>
              <CardDescription>{enterpriseData.industry}</CardDescription>
            </div>
          </div>
          {isEditing ? (
            <div className="flex flex-row gap-2">
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                {t("General.cancel")}
              </Button>
              <Button form="enterprise-form" type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("General.save")}
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="h-4 w-4" />
              {t("General.edit")}
            </Button>
          )}
        </div>

        <Card className="w-full">
          <CardHeader></CardHeader>
          <CardContent>
            <EnterpriseForm
              defaultValues={{
                ...formData,
                industry: formData.industry ?? undefined,
                email: formData.email ?? undefined,
                logo: formData.logo ?? undefined,
                website: undefined,
                phone: undefined,
                employees: undefined,
                description: undefined,
                address: undefined,
                founded: undefined,
              }}
              formId="enterprise-form"
              readOnly={!isEditing}
              loading={isSaving}
              onSubmit={async (values) => {
                setIsSaving(true);
                try {
                  const response = await fetch("/api/enterprise", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...values, id: enterprise.id }),
                  });
                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Failed to update enterprise");
                  }
                  const updated = await response.json();
                  setEnterpriseData(updated);
                  setFormData(updated);
                  setIsEditing(false);
                  toast.success("Enterprise information updated", {
                    description: "The enterprise information has been successfully updated.",
                  });
                } catch (err: any) {
                  toast.error("Failed to update enterprise", {
                    description: err.message,
                  });
                } finally {
                  setIsSaving(false);
                }
              }}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnterprisePage;

EnterprisePage.messages = ["Pages", "General", "Enterprise"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../locales/${locale}.json`)).default,
        EnterprisePage.messages,
      ),
    },
  };
};
