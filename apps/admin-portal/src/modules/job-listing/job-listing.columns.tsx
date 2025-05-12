import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { JobListingWithJobs } from "./job-listing.type";

const useCompanyColumns = () => {
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
      validationSchema: z.boolean(),
      cellType: "status",
      options: [
        { value: "active", label: t("JobListings.form.status.active") },
        { value: "inactive", label: t("JobListings.form.status.inactive") },
      ],
    },
  ];

  return columns;
};

export default useCompanyColumns;
