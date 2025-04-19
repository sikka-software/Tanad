import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";

import { generateDummyData } from "@/lib/dummy-generator";

import { EmployeeForm, type EmployeeFormValues } from "@/modules/employee/employee.form";
import { useCreateEmployee } from "@/modules/employee/employee.hooks";
import { useEmployeesStore } from "@/modules/employee/employee.store";

export default function AddEmployeePage() {
  const t = useTranslations();
  const router = useRouter();
  const { loadingSave, setLoadingSave } = useEmployeesStore();
  const { mutate: createEmployee } = useCreateEmployee();

  const handleSubmit = async (data: EmployeeFormValues) => {
    setLoadingSave(true);
    try {
      await createEmployee({
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || undefined,
        position: data.position.trim(),
        hire_date: data.hire_date?.toISOString(),
        salary: data.salary ? parseFloat(data.salary) : undefined,
        status: data.status,
        notes: data.notes?.trim() || undefined,
        department_id: data.department || undefined,
      });

      toast.success(t("General.successful_operation"), {
        description: t("Employees.success.created"),
      });
      router.push("/employees");
      setLoadingSave(false);
    } catch (error) {
      console.error(error);
      setLoadingSave(false);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Employees.error.create"),
      });
      throw error;
    }
  };

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).employeeForm;
    if (form) {
      form.setValue("first_name", dummyData.first_name);
      form.setValue("last_name", dummyData.last_name);
      form.setValue("email", dummyData.email);
      form.setValue("phone", dummyData.phone);
      form.setValue("position", dummyData.employee_position);
      form.setValue("hire_date", dummyData.employee_hire_date);
      form.setValue("salary", dummyData.employee_salary);
      form.setValue("status", dummyData.employee_status);
      form.setValue("notes", dummyData.employee_notes);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Employees.add_new")} />
      <PageTitle
        title={t("Employees.add_new")}
        formButtons
        formId="employee-form"
        loading={loadingSave}
        onCancel={() => router.push("/employees")}
        texts={{
          submit_form: t("Employees.add_new"),
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
        <EmployeeForm id="employee-form" onSubmit={handleSubmit} />
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
