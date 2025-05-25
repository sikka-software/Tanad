import { useLocale, useTranslations } from "next-intl";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import CodeCell from "@/tables/code-cell";
import StatusCell from "@/tables/status-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { Document } from "@/document/document.type";

const useBranchColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const locale = useLocale();

  const columns: ExtendedColumnDef<Document>[] = [
    {
      accessorKey: "name",
      header: t("Documents.form.name.label"),
    },
    {
      noPadding: true,
      accessorKey: "code",
      header: t("Documents.form.url.label"),
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
      accessorKey: "file_path",
      header: t("Documents.form.file_path.label"),
    },
    {
      accessorKey: "entity_id",
      header: t("Documents.form.entity_id.label"),
      cell: ({ getValue }) => <div dir="ltr">{getValue() as string}</div>,
    },
    {
      accessorKey: "entity_type",
      header: t("Documents.form.entity_type.label"),
      noPadding: true,
      cell: ({ row }) => {
        const branch = row.original;
        return (
          <ComboboxAdd
            isolated
            dir={locale === "ar" ? "rtl" : "ltr"}
            inCell
            data={[]}
            isLoading={false}
            buttonClassName="bg-transparent"
            defaultValue={branch.entity_type || ""}
            onChange={async (value) => handleEdit?.(branch.id, "entity_type", value)}
            texts={{
              placeholder: ". . .",
              searchPlaceholder: t("Documents.form.entity_type.search"),
              noItems: t("Documents.form.entity_type.no_items"),
            }}
            addText={t("Documents.form.entity_type.add")}
          />
        );
      },
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

export default useBranchColumns;
