import CodeCell from "@/components/tables/code-cell";
import { useLocale, useTranslations } from "next-intl";
import { z } from "zod";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import StatusCell from "@/components/tables/status-cell";

import { useEmployees } from "../employee/employee.hooks";
import { Branch } from "./branch.type";

const useBranchColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const locale = useLocale();

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
      noPadding: true,
      accessorKey: "code",
      header: t("Branches.form.code.label"),
      validationSchema: z.string().min(1, t("Branches.form.code.required")),
      cell: ({ getValue, row }) => (
        <CodeCell
          onChange={(e) => handleEdit?.(row.id, "code", e.target.value)}
          onRandom={() => {
            const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let randomCode = "";
            for (let i = 0; i < 5; i++) {
              randomCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
            }
            handleEdit?.(row.id, "code", `BR-${randomCode}`);
          }}
          onSerial={() => {
            const paddedNumber = String(row.index + 1).padStart(4, "0");
            handleEdit?.(row.id, "code", `BR-${paddedNumber}`);
          }}
          code={getValue() as string}
          onCodeChange={() => console.log("changing")}
        />
      ),
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
            onChange={async (value) => handleEdit?.(branch.id, "manager", value)}
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
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => {
        const status = getValue() as string;
        const rowId = row.original.id;
        return (
          <StatusCell
            status={status}
            statusOptions={[
              { label: t("Branches.form.status.active"), value: "active" },
              { label: t("Branches.form.status.inactive"), value: "inactive" },
            ]}
            onStatusChange={async (value) => handleEdit?.(rowId, "status", value)}
          />
        );
      },
    },
  ];

  return columns;
};

export default useBranchColumns;
