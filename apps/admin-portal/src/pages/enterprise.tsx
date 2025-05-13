"use client";

import { pick } from "lodash";
import { Asterisk, Edit, Save, X, Loader2 } from "lucide-react";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import useUserStore from "@/stores/use-user-store";

const EnterprisePage = () => {
  const enterprise = useUserStore((state) => state.enterprise);

  if (!enterprise) {
    return <div>Loading enterprise details...</div>;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [enterpriseData, setEnterpriseData] = useState(enterprise);
  const [formData, setFormData] = useState(enterprise);
  const [isSaving, setIsSaving] = useState(false);

  //   const isSuperAdmin = userRole === "superadmin";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const t = useTranslations();

  return (
    <div>
      <div className="mx-auto flex flex-col gap-4 p-4">
        <div className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-4">
            <Asterisk className="h-16 w-16 rounded-md border object-contain p-2" />
            {/* <img
                src={enterpriseData.name || "/placeholder.svg"}
                alt={`${enterpriseData.name} logo`}
                className="h-16 w-16 rounded-md border object-contain p-2"
              /> */}
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
              <Button onClick={handleSave} disabled={isSaving}>
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Enterprise Name</Label>
                  <Input
                    readOnly={!isEditing}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    readOnly={!isEditing}
                    id="industry"
                    name="industry"
                    value={formData.industry ?? ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founded">Founded</Label>
                  <Input
                    readOnly={!isEditing}
                    id="founded"
                    name="founded"
                    //   value={formData.founded ?? ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employees">Number of Employees</Label>
                  <Input
                    readOnly={!isEditing}
                    id="employees"
                    name="employees"
                    //   value={formData.employees ?? ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    readOnly={!isEditing}
                    id="website"
                    name="website"
                    //   value={formData.website ?? ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    readOnly={!isEditing}
                    id="email"
                    name="email"
                    value={formData.email ?? ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    readOnly={!isEditing}
                    id="phone"
                    name="phone"
                    //   value={formData.phone ?? ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    readOnly={!isEditing}
                    id="logo"
                    name="logo"
                    //   value={formData.logo ?? ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  readOnly={!isEditing}
                  id="address"
                  name="address"
                  // value={formData.address ?? ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  readOnly={!isEditing}
                  id="description"
                  name="description"
                  // value={formData.description ?? ""}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnterprisePage;

EnterprisePage.messages = ["Pages", "General", "Enterprise"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../locales/${locale}.json`)).default,
        EnterprisePage.messages,
      ),
    },
  };
};
