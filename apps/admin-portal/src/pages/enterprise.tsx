"use client";

import { pick } from "lodash";
import { Asterisk, Edit, Save, X } from "lucide-react";
import { GetStaticProps } from "next";
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

  //   const isSuperAdmin = userRole === "superadmin";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setEnterpriseData(formData);
    setIsEditing(false);
    toast.success("Enterprise information updated", {
      description: "The enterprise information has been successfully updated.",
    });
  };

  const handleCancel = () => {
    setFormData(enterpriseData);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="container mx-auto p-4">
        <Card className="w-full">
          <CardHeader>
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
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Enterprise Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      name="industry"
                      value={formData.industry ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="founded">Founded</Label>
                    <Input
                      id="founded"
                      name="founded"
                      //   value={formData.founded ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employees">Number of Employees</Label>
                    <Input
                      id="employees"
                      name="employees"
                      //   value={formData.employees ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      //   value={formData.website ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      //   value={formData.phone ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
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
                    id="address"
                    name="address"
                    // value={formData.address ?? ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    // value={formData.description ?? ""}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">About</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {/* {enterpriseData.description ?? ""} */}
                  </p>
                </div>
                <Separator />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium">Contact Information</h3>
                    <dl className="mt-2 space-y-1">
                      <div className="text-sm">
                        <dt className="inline font-medium">Address:</dt>{" "}
                        {/* <dd className="inline">{enterpriseData.address ?? ""}</dd> */}
                      </div>
                      <div className="text-sm">
                        <dt className="inline font-medium">Phone:</dt>{" "}
                        {/* <dd className="inline">{enterpriseData.phone ?? ""}</dd> */}
                      </div>
                      <div className="text-sm">
                        <dt className="inline font-medium">Email:</dt>{" "}
                        <dd className="inline">{enterpriseData.email ?? ""}</dd>
                      </div>
                      <div className="text-sm">
                        <dt className="inline font-medium">Website:</dt>{" "}
                        <dd className="inline">
                          {/* <a
                            href={enterpriseData.website ?? ""}
                            className="text-primary hover:underline"
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            {enterpriseData.website ?? ""}
                          </a> */}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Company Details</h3>
                    <dl className="mt-2 space-y-1">
                      <div className="text-sm">
                        <dt className="inline font-medium">Founded:</dt>{" "}
                        {/* <dd className="inline">{enterpriseData.founded ?? ""}</dd> */}
                      </div>
                      <div className="text-sm">
                        <dt className="inline font-medium">Employees:</dt>{" "}
                        {/* <dd className="inline">{enterpriseData.employees ?? ""}</dd> */}
                      </div>
                      <div className="text-sm">
                        <dt className="inline font-medium">Industry:</dt>{" "}
                        <dd className="inline">{enterpriseData.industry}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          {isEditing && (
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>{" "}
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
