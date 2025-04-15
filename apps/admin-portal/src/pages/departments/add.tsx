import { useState, useEffect } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import DepartmentForm, { type DepartmentFormValues } from "@/components/forms/department-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { generateDummyData } from "@/lib/dummy-generator";
import { supabase } from "@/lib/supabase";

export default function AddDepartmentPage() {
  const router = useRouter();
  const t = useTranslations();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      } else {
        router.push("/auth/login");
      }
    };

    getUserId();
  }, [router]);

  const handleSubmit = async (data: DepartmentFormValues) => {
    setLoading(true);
    try {
      // Check if user ID is available
      if (!userId) {
        throw new Error(t("Departments.error.not_authenticated"));
      }

      // First create the department
      const { data: newDepartment, error: departmentError } = await supabase
        .from("departments")
        .insert([
          {
            name: data.name.trim(),
            description: data.description?.trim() || null,
            user_id: userId,
          },
        ])
        .select()
        .single();

      if (departmentError) throw departmentError;

      // Then create the department locations
      if (data.locations && data.locations.length > 0) {
        const locationInserts = data.locations.map((locationId) => ({
          department_id: newDepartment.id,
          location_id: locationId,
          location_type: "office", // Default to office type
        }));

        const { error: locationError } = await supabase
          .from("department_locations")
          .insert(locationInserts);

        if (locationError) throw locationError;

        // Update the department object with locations before caching
        newDepartment.locations = data.locations;
      }

      const previousDepartments = queryClient.getQueryData(["departments"]) || [];
      queryClient.setQueryData(
        ["departments"],
        [...(Array.isArray(previousDepartments) ? previousDepartments : []), newDepartment],
      );

      // Also set the individual department query data
      queryClient.setQueryData(["departments", newDepartment.id], newDepartment);

      toast.success(t("General.successful_operation"), {
        description: t("Departments.success.created"),
      });

      router.push("/departments");
    } catch (error) {
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Departments.error.create"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).departmentForm;
    if (form) {
      form.setValue("name", dummyData.name);
      form.setValue("description", dummyData.description);
      form.setValue("locations", dummyData.locations);
    }
  };

  return (
    <div>
      <PageTitle
        title={t("Departments.add_new")}
        formButtons
        formId="department-form"
        loading={loading}
        onCancel={() => router.push("/departments")}
        texts={{
          submit_form: t("Departments.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <div className="p-4">
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="relative">
            {/* {process.env.NODE_ENV === "development" && (
              <Button variant="outline" className="absolute end-4 top-4" onClick={handleDummyData}>
                Dummy Data
              </Button>
            )} */}
            <CardTitle>{t("Departments.department_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentForm
              id="department-form"
              userId={userId}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
