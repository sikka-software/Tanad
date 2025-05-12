import { ComboboxAdd } from "@root/src/components/ui/comboboxes/combobox-add";
import useUserStore from "@root/src/stores/use-user-store";
import { useLocale, useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { useEmployees } from "../employee/employee.hooks";
import { useUpdateOffice } from "./office.hooks";
import { Office } from "./office.type";

const useOfficeColumns = (handleEdit?: (id: string, field: string, value: string) => void) => {
  const t = useTranslations();
  const { mutate: updateOffice } = useUpdateOffice();
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
      cellType: "code",
      onSerial: (row, rowIndex) => {
        const paddedNumber = String(rowIndex + 1).padStart(4, "0");
        handleEdit?.(row.id, "code", `OF-${paddedNumber}`);
      },
      onRandom: (row) => {
        const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let randomCode = "";
        for (let i = 0; i < 5; i++) {
          randomCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        handleEdit?.(row.id, "code", `OF-${randomCode}`);
      },
      accessorKey: "code",
      header: t("Offices.form.code.label"),
      validationSchema: z.string().min(1, t("Offices.form.code.required")),
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
              await updateOffice({
                id: office.id,
                office: {
                  manager: value || null,
                },
              });
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
      header: t("Offices.form.status.label"),
      validationSchema: z.enum(["active", "inactive"]),
      cellType: "status",
      options: [
        { label: t("Offices.form.status.active"), value: "active" },
        { label: t("Offices.form.status.inactive"), value: "inactive" },
      ],
    },
  ];

  return columns;
};

export default useOfficeColumns;
