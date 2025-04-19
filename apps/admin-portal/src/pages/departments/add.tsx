import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import DepartmentForm, {
  type DepartmentFormValues,
} from "@/modules/department/department.form";
import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { departmentKeys } from "@/hooks/models/useDepartments";
import useUserStore from "@/stores/use-user-store";
import { createClient } from "@/utils/supabase/component";

export default function AddDepartmentPage() {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const handleSubmit = async (data: DepartmentFormValues) => {
    setLoading(true);
    try {
      // Check if user ID is available
      if (!user?.id) {
        throw new Error(t("Departments.error.not_authenticated"));
      }

      // First create the department
      const { data: newDepartment, error: departmentError } = await supabase
        .from("departments")
        .insert([
          {
            name: data.name.trim(),
            description: data.description?.trim() || null,
            user_id: user.id,
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

      const previousDepartments = queryClient.getQueryData(departmentKeys.lists()) || [];
      queryClient.setQueryData(departmentKeys.lists(), [
        ...(Array.isArray(previousDepartments) ? previousDepartments : []),
        newDepartment,
      ]);

      // Also set the individual department query data
      queryClient.setQueryData(["departments", newDepartment.id], newDepartment);

      toast.success(t("General.successful_operation"), {
        description: t("Departments.success.created"),
      });

      router.push("/departments");
    } catch (error) {
      console.error("Failed to save department:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Departments.error.create"),
      });
      setLoading(false);
    }
  };

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).departmentForm;
    if (form) {
      form.setValue("name", dummyData.name);
      form.setValue("description", dummyData.description);
      // form.setValue("locations", dummyData.locations);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Departments.add_new")} />
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
        customButton={
          process.env.NODE_ENV === "development" && (
            <Button variant="outline" size="sm" onClick={handleDummyData}>
              Dummy Data
            </Button>
          )
        }
      />

      <div className="mx-auto max-w-2xl p-4">
        <DepartmentForm id="department-form" onSubmit={handleSubmit} loading={loading} />
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
