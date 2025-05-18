import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import CodeCell from "@/tables/code-cell";
import StatusCell from "@/tables/status-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { Warehouse } from "@/warehouse/warehouse.type";

import { useEmployees } from "@/employee/employee.hooks";

const useWarehouseColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const locale = useLocale();

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();

  const employeeOptions = useMemo(
    () =>
      employees.map((emp) => ({
        label: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
      })),
    [employees],
  );

  const columns: ExtendedColumnDef<Warehouse>[] = [
    {
      accessorKey: "name",
      header: t("Warehouses.form.name.label"),
    },
    {
      noPadding: true,
      accessorKey: "code",
      header: t("Warehouses.form.code.label"),
      cell: ({ getValue, row }) => (
        <CodeCell
          onChange={(e) => handleEdit?.(row.id, "code", e.target.value)}
          onRandom={() => {
            const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let randomCode = "";
            for (let i = 0; i < 5; i++) {
              randomCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
            }
            handleEdit?.(row.id, "code", `WH-${randomCode}`);
          }}
          onSerial={() => {
            const paddedNumber = String(row.index + 1).padStart(4, "0");
            handleEdit?.(row.id, "code", `WH-${paddedNumber}`);
          }}
          code={getValue() as string}
          onCodeChange={() => console.log("changing")}
        />
      ),
    },

    {
      accessorKey: "email",
      header: t("Warehouses.form.email.label"),
    },
    {
      accessorKey: "phone",
      header: t("Warehouses.form.phone.label"),
      cell: ({ getValue }) => <div dir="ltr">{getValue() as string}</div>,
    },
    {
      accessorKey: "area",
      header: t("Warehouses.form.area.label"),
    },
    {
      accessorKey: "capacity",
      header: t("Warehouses.form.capacity.label"),
    },

    {
      accessorKey: "manager",
      header: t("Warehouses.form.manager.label"),
      noPadding: true,
      cell: ({ row }) => {
        const warehouse = row.original;
        return (
          <ComboboxAdd
            isolated
            dir={locale === "ar" ? "rtl" : "ltr"}
            inCell
            data={employeeOptions}
            isLoading={employeesLoading}
            buttonClassName="bg-transparent"
            defaultValue={warehouse.manager || ""}
            onChange={async (value) => handleEdit?.(warehouse.id, "manager", value)}
            texts={{
              placeholder: ". . .",
              searchPlaceholder: t("Pages.Employees.search"),
              noItems: t("Warehouses.form.manager.no_employees"),
            }}
            renderSelected={(value) => {
              return <p className="pe-2 text-start">{value.label}</p>;
            }}
            addText={t("Pages.Employees.add")}
          />
        );
      },
    },

    {
      accessorKey: "city",
      header: t("Forms.city.label"),
    },
    {
      accessorKey: "region",
      header: t("Forms.region.label"),
    },
    {
      accessorKey: "zip_code",
      header: t("Forms.zip_code.label"),
    },

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

export default useWarehouseColumns;
