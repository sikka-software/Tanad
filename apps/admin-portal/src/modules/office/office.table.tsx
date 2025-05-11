import CodeInput from "@root/src/components/ui/code-input";
import { ComboboxAdd } from "@root/src/components/ui/combobox-add";
import { CommandSelect } from "@root/src/components/ui/command-select";
import { Input } from "@root/src/components/ui/input";
import { useLocale, useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateOffice } from "@/office/office.hooks";
import useOfficeStore from "@/office/office.store";
import { Office } from "@/office/office.type";

import useUserStore from "@/stores/use-user-store";

import { useEmployees } from "../employee/employee.hooks";

const OfficesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Office>) => {
  const t = useTranslations();
  const locale = useLocale();
  const { mutate: updateOffice } = useUpdateOffice();

  const selectedRows = useOfficeStore((state) => state.selectedRows);
  const setSelectedRows = useOfficeStore((state) => state.setSelectedRows);

  const canEditOffice = useUserStore((state) => state.hasPermission("offices.update"));
  const canDuplicateOffice = useUserStore((state) => state.hasPermission("offices.duplicate"));
  const canViewOffice = useUserStore((state) => state.hasPermission("offices.view"));
  const canArchiveOffice = useUserStore((state) => state.hasPermission("offices.archive"));
  const canDeleteOffice = useUserStore((state) => state.hasPermission("offices.delete"));

  // Employees for manager combobox
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

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
        handleEdit(row.id, "code", `OF-${paddedNumber}`);
      },
      onRandom: (row) => {
        const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let randomCode = "";
        for (let i = 0; i < 5; i++) {
          randomCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        handleEdit(row.id, "code", `OF-${randomCode}`);
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

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "office_id") return;
    await updateOffice({ id: rowId, office: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Office[]) => {
      const newSelectedIds = rows.map((row) => row.id!);
      // Only update if the selection has actually changed
      if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
        setSelectedRows(newSelectedIds);
      }
    },
    [selectedRows, setSelectedRows],
  );

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const officeTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Office) => row.id!,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id!]);
      handleRowSelectionChange(selectedRows);
    },
  };

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      enableRowActions={true}
      enableColumnSizing={true}
      canEditAction={canEditOffice}
      canDuplicateAction={canDuplicateOffice}
      canViewAction={canViewOffice}
      canArchiveAction={canArchiveOffice}
      canDeleteAction={canDeleteOffice}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={officeTableOptions}
      onActionClicked={onActionClicked}
      texts={{
        actions: t("General.actions"),
        edit: t("General.edit"),
        duplicate: t("General.duplicate"),
        view: t("General.view"),
        archive: t("General.archive"),
        delete: t("General.delete"),
      }}
    />
  );
};

export default OfficesTable;
