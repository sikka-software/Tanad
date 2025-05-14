import StatusCell from "@root/src/components/tables/status-cell";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { JobListingWithJobs } from "./job-listing.type";

const useCompanyColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();

  const columns: ExtendedColumnDef<JobListingWithJobs>[] = [
    {
      accessorKey: "title",
      header: t("JobListings.form.title.label"),
      validationSchema: z.string().min(1, t("JobListings.form.title.required")),
    },
    {
      accessorKey: "description",
      header: t("JobListings.form.description.label"),
      validationSchema: z.string().min(1, t("JobListings.form.description.required")),
    },

    {
      accessorKey: "slug",
      header: t("JobListings.form.slug.label"),
      validationSchema: z.string().min(1, t("JobListings.form.slug.required")),
    },
    {
      accessorKey: "jobs_count",
      header: t("JobListings.jobs_count.label", { defaultMessage: "Jobs" }),
      enableEditing: false,
      cell: ({ row }) => row.original.jobs_count,
    },
    {
      accessorKey: "status",
      maxSize: 80,
      header: t("JobListings.form.status.label"),
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
              { label: t("JobListings.form.status.active"), value: "active" },
              { label: t("JobListings.form.status.inactive"), value: "inactive" },
            ]}
            onStatusChange={async (value) => handleEdit?.(rowId, "status", value)}
          />
        );
      },
    },
  ];

  return columns;
};

export default useCompanyColumns;
