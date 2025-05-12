import { ComboboxAdd } from "@root/src/components/ui/comboboxes/combobox-add";
import useUserStore from "@root/src/stores/use-user-store";
import { useLocale, useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { useEmployees } from "../employee/employee.hooks";
import { useUpdateBranch } from "./branch.hooks";
import { Branch } from "./branch.type";

const useBranchColumns = () => {
  const t = useTranslations();
  const locale = useLocale();
  const { mutate: updateBranch } = useUpdateBranch();
  // Employees for manager combobox
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  const columns: ExtendedColumnDef<Branch>[] = [
    {
      accessorKey: "name",
      header: t("Branches.form.name.label"),
      validationSchema: z.string().min(1, t("Branches.form.name.required")),
    },
    {
      accessorKey: "code",
      header: t("Branches.form.code.label"),
      validationSchema: z.string().min(1, t("Branches.form.code.required")),
    },
    {
      accessorKey: "email",
      header: t("Branches.form.email.label"),
      validationSchema: z.string().email(t("Branches.form.email.invalid")),
    },
    {
      accessorKey: "phone",
      header: t("Branches.form.phone.label"),
      validationSchema: z.string().nullable(),
    },
    {
      accessorKey: "manager",
      header: t("Branches.form.manager.label"),
      noPadding: true,
      validationSchema: z.string().nullable(),
      cell: ({ row }) => {
        const branch = row.original;
        return (
          <ComboboxAdd
            dir={locale === "ar" ? "rtl" : "ltr"}
            inCell
            data={employeeOptions}
            isLoading={employeesLoading}
            buttonClassName="bg-transparent"
            defaultValue={branch.manager || ""}
            onChange={async (value) => {
              await updateBranch({
                id: branch.id,
                data: {
                  id: branch.id,
                  name: branch.name,
                  status: branch.status,
                  manager: value || null,
                },
              });
            }}
            texts={{
              placeholder: ". . .",
              searchPlaceholder: t("Pages.Employees.search"),
              noItems: t("Branches.form.manager.no_employees"),
            }}
            addText={t("Pages.Employees.add")}
            ariaInvalid={false}
          />
        );
      },
    },

    {
      accessorKey: "address",
      header: t("Forms.address.label"),
      validationSchema: z.string().min(1, t("Forms.address.required")),
    },
    {
      accessorKey: "city",
      header: t("Forms.city.label"),
      validationSchema: z.string().min(1, t("Forms.city.required")),
    },
    {
      accessorKey: "region",
      header: t("Forms.region.label"),
      validationSchema: z.string().min(1, t("Forms.region.required")),
    },
    {
      accessorKey: "zip_code",
      header: t("Forms.zip_code.label"),
      validationSchema: z.string().min(1, t("Forms.zip_code.required")),
    },
    {
      accessorKey: "status",
      maxSize: 80,
      header: t("Branches.form.status.label"),
      validationSchema: z.enum(["active", "inactive"]),
      cellType: "status",
      options: [
        { label: t("Branches.form.status.active"), value: "active" },
        { label: t("Branches.form.status.inactive"), value: "inactive" },
      ],
    },
  ];

  return columns;
};

export default useBranchColumns;
