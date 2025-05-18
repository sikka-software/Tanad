import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { z } from "zod";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import PhoneInput from "@/components/ui/inputs/phone-input";

import CodeCell from "@/tables/code-cell";
import StatusCell from "@/tables/status-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { Branch } from "@/branch/branch.type";

import { useEmployees } from "@/employee/employee.hooks";

const useBranchColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const locale = useLocale();

  const { data: employees = [], isLoading: isFetchingEmployees } = useEmployees();

  const employeeOptions = useMemo(
    () =>
      employees.map((emp) => ({
        label: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
      })),
    [employees],
  );

  const columns: ExtendedColumnDef<Branch>[] = [
    {
      accessorKey: "name",
      header: t("Branches.form.name.label"),
    },
    {
      noPadding: true,
      accessorKey: "code",
      header: t("Branches.form.code.label"),
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
    },
    {
      accessorKey: "phone",
      header: t("Branches.form.phone.label"),
      cell: ({ getValue }) => <div dir="ltr">{getValue() as string}</div>,
    },
    {
      accessorKey: "manager",
      header: t("Branches.form.manager.label"),
      noPadding: true,
      cell: ({ row }) => {
        const branch = row.original;
        return (
          <ComboboxAdd
            isolated
            dir={locale === "ar" ? "rtl" : "ltr"}
            inCell
            data={employeeOptions}
            isLoading={isFetchingEmployees}
            buttonClassName="bg-transparent"
            defaultValue={branch.manager || ""}
            onChange={async (value) => handleEdit?.(branch.id, "manager", value)}
            texts={{
              placeholder: ". . .",
              searchPlaceholder: t("Pages.Employees.search"),
              noItems: t("Branches.form.manager.no_employees"),
            }}
            addText={t("Pages.Employees.add")}
          />
        );
      },
    },
    { accessorKey: "city", header: t("Forms.city.label") },
    { accessorKey: "region", header: t("Forms.region.label") },
    { accessorKey: "zip_code", header: t("Forms.zip_code.label") },
    {
      accessorKey: "created_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.created_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "updated_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.updated_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "status",
      maxSize: 80,
      header: t("CommonStatus.label"),
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

export default useBranchColumns;
