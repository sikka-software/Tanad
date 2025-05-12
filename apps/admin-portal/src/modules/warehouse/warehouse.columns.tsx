import { ComboboxAdd } from "@root/src/components/ui/comboboxes/combobox-add";
import { useLocale, useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { useEmployees } from "../employee/employee.hooks";
import { useUpdateWarehouse } from "./warehouse.hooks";
import { Warehouse } from "./warehouse.type";

const useWarehouseColumns = () => {
  const t = useTranslations();
  const locale = useLocale();
  const { mutate: updateWarehouse } = useUpdateWarehouse();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  const columns: ExtendedColumnDef<Warehouse>[] = [
    {
      accessorKey: "name",
      header: t("Warehouses.form.name.label"),
      validationSchema: z.string().min(1, t("Warehouses.form.name.required")),
    },
    {
      accessorKey: "code",
      header: t("Warehouses.form.code.label"),
      validationSchema: z.string().min(1, t("Warehouses.form.code.required")),
    },
    {
      accessorKey: "email",
      header: t("Warehouses.form.email.label"),
      validationSchema: z.string().email(t("Warehouses.form.email.invalid")),
    },
    {
      accessorKey: "phone",
      header: t("Warehouses.form.phone.label"),
      validationSchema: z.string().nullable(),
    },
    {
      accessorKey: "capacity",
      header: t("Warehouses.form.capacity.label"),
      validationSchema: z.number().min(0, t("Warehouses.form.capacity.invalid")),
    },

    {
      accessorKey: "manager",
      header: t("Warehouses.form.manager.label"),
      noPadding: true,
      validationSchema: z.string().nullable(),
      cell: ({ row }) => {
        const warehouse = row.original;
        return (
          <ComboboxAdd
            dir={locale === "ar" ? "rtl" : "ltr"}
            inCell
            data={employeeOptions}
            isLoading={employeesLoading}
            buttonClassName="bg-transparent"
            defaultValue={warehouse.manager || ""}
            onChange={async (value) => {
              await updateWarehouse({
                id: warehouse.id,
                data: {
                  manager: value || null,
                },
              });
            }}
            texts={{
              placeholder: ". . .",
              searchPlaceholder: t("Pages.Employees.search"),
              noItems: t("Warehouses.form.manager.no_employees"),
            }}
            renderSelected={(value) => {
              return <p className="pe-2 text-start">{value.label}</p>;
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
      header: t("Warehouses.form.status.label"),
      validationSchema: z.enum(["active", "inactive"]),
      cellType: "status",
      options: [
        { label: t("Warehouses.form.status.active"), value: "active" },
        { label: t("Warehouses.form.status.inactive"), value: "inactive" },
      ],
    },
  ];

  return columns;
};

export default useWarehouseColumns;
