import { useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { CardContent } from "@/ui/card";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { useUpdateJobListing } from "@/job-listing/job-listing.hooks";
import useJobListingStore from "@/job-listing/job-listing.store";
import { JobListingWithJobs } from "@/job-listing/job-listing.type";

const JobListingCard = ({
  jobListing,
  onActionClicked,
}: {
  jobListing: JobListingWithJobs;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateJobListing } = useUpdateJobListing();
  const data = useJobListingStore((state) => state.data);
  const setData = useJobListingStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateJobListing({ id: rowId, data: { [columnId]: value } });
  };

  return (
    <ModuleCard
      id={jobListing.id}
      title={jobListing.title}
      subtitle={String(jobListing.jobs_count)}
      currentStatus={jobListing.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(jobListing.id, "status", status)}
      onEdit={() => onActionClicked("edit", jobListing.id)}
      onDelete={() => onActionClicked("delete", jobListing.id)}
      onDuplicate={() => onActionClicked("duplicate", jobListing.id)}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{jobListing.title}</h3>
          <p className="text-sm text-gray-500">
            {jobListing.jobs_count}{" "}
            {jobListing.jobs_count === 1 ? t("General.job") : t("Jobs.title")}
          </p>
        </div>
        <Badge variant={jobListing.status === "active" ? "default" : "secondary"}>
          {jobListing.status === "active"
            ? t("JobListings.status.active")
            : t("JobListings.status.inactive")}
        </Badge>
      </div>
      <CardContent>
        <div className="space-y-3">
          {jobListing.description && (
            <p className="text-sm text-gray-600">{jobListing.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              {t("General.created_at")}: {new Date(jobListing.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </ModuleCard>
  );
};

export default JobListingCard;
