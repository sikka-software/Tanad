import { useLocale, useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import { ComboboxAdd } from "@root/src/components/ui/comboboxes/combobox-add";
import { CommandSelect } from "@/ui/command-select";
import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useEmployees } from "@/employee/employee.hooks";

import useUserStore from "@/stores/use-user-store";

import { useUpdateBranch } from "./branch.hooks";
import useBranchStore from "./branch.store";
import { Branch } from "./branch.type";

const BranchesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Branch>) => {
  const t = useTranslations();
  const locale = useLocale();
  const { mutate: updateBranch } = useUpdateBranch();
  const selectedRows = useBranchStore((state) => state.selectedRows);
  const setSelectedRows = useBranchStore((state) => state.setSelectedRows);

  const canEditBranch = useUserStore((state) => state.hasPermission("branches.update"));
  const canDuplicateBranch = useUserStore((state) => state.hasPermission("branches.duplicate"));
  const canViewBranch = useUserStore((state) => state.hasPermission("branches.view"));
  const canArchiveBranch = useUserStore((state) => state.hasPermission("branches.archive"));
  const canDeleteBranch = useUserStore((state) => state.hasPermission("branches.delete"));

  // Employees for manager combobox
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

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

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "branch_id") return;
    const branch = data.find((b) => b.id === rowId);
    if (!branch) return;
    await updateBranch({
      id: branch.id,
      data: {
        id: branch.id,
        name: branch.name,
        status: branch.status,
        [columnId]: value,
      },
    });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Branch[]) => {
      const newSelectedIds = rows.map((row) => row.id);
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

  const branchTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Branch) => row.id,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id]);
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
      canEditAction={canEditBranch}
      canDuplicateAction={canDuplicateBranch}
      canViewAction={canViewBranch}
      canArchiveAction={canArchiveBranch}
      canDeleteAction={canDeleteBranch}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={branchTableOptions}
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

export default BranchesTable;
