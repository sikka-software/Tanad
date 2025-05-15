import { useLocale, useTranslations } from "next-intl";
import { z } from "zod";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import CodeCell from "@/components/tables/code-cell";
import StatusCell from "@/components/tables/status-cell";

import { Office } from "@/office/office.type";

import { useEmployees } from "@/employee/employee.hooks";

const useOfficeColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const locale = useLocale();
  // Employees for manager combobox
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));
  const columns: ExtendedColumnDef<Office>[] = [
    {
      accessorKey: "name",
      header: t("Offices.form.name.label"),
      validationSchema: z.string().min(1, t("Offices.form.name.required")),
    },
    {
      noPadding: true,
      accessorKey: "code",
      header: t("Offices.form.code.label"),
      validationSchema: z.string().min(1, t("Offices.form.code.required")),
      cell: ({ getValue, row }) => (
        <CodeCell
          onChange={(e) => handleEdit?.(row.id, "code", e.target.value)}
          onRandom={() => {
            const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let randomCode = "";
            for (let i = 0; i < 5; i++) {
              randomCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
            }
            handleEdit?.(row.id, "code", `OF-${randomCode}`);
          }}
          onSerial={() => {
            const paddedNumber = String(row.index + 1).padStart(4, "0");
            handleEdit?.(row.id, "code", `OF-${paddedNumber}`);
          }}
          code={getValue() as string}
          onCodeChange={() => console.log("changing")}
        />
      ),
    },

    {
      accessorKey: "email",
      header: t("Offices.form.email.label"),
      validationSchema: z.string().email(t("Offices.form.email.invalid")),
    },
    {
      accessorKey: "phone",
      header: t("Offices.form.phone.label"),
      validationSchema: z.string().min(1, t("Offices.form.phone.required")),
    },
    {
      accessorKey: "manager",
      header: t("Offices.form.manager.label"),
      validationSchema: z.string().nullable(),
      noPadding: true,

      cell: ({ row }) => {
        const office = row.original;
        return (
          <ComboboxAdd
            dir={locale === "ar" ? "rtl" : "ltr"}
            inCell
            data={employeeOptions}
            isLoading={employeesLoading}
            buttonClassName="bg-transparent"
            defaultValue={office.manager || ""}
            onChange={async (value) => {
              handleEdit?.(office.id, "manager", value);
            }}
            texts={{
              placeholder: ". . .",
              searchPlaceholder: t("Pages.Employees.search"),
              noItems: t("Offices.form.manager.no_employees"),
            }}
            addText={t("Pages.Employees.add")}
            ariaInvalid={false}
          />
        );
      },
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
      header: t("CommonStatus.label"),
      validationSchema: z.enum(["active", "inactive"]),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => {
        const status = getValue() as string;
        const rowId = row.original.id;
        return (
          <StatusCell
            status={status}
            statusOptions={[
              { label: t("CommonStatus.active"), value: "active" },
              { label: t("CommonStatus.inactive"), value: "inactive" },
            ]}
            onStatusChange={async (value) => handleEdit?.(rowId, "status", value)}
          />
        );
      },
    },
  ];

  return columns;
};

export default useOfficeColumns;
