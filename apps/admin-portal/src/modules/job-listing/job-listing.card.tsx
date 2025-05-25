import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { useUpdateJobListing } from "@/job-listing/job-listing.hooks";
import useJobListingStore from "@/job-listing/job-listing.store";
import { JobListingWithJobs, JobListingUpdateData } from "@/job-listing/job-listing.type";

const JobListingCard = ({
  jobListing,
  onActionClicked,
}: {
  jobListing: JobListingWithJobs;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateJobListing } = useUpdateJobListing();
  const storeData = useJobListingStore((state) => state.data);
  const setData = useJobListingStore((state) => state.setData);

  const handleEdit = createHandleEdit<JobListingWithJobs, JobListingUpdateData>(
    setData,
    updateJobListing,
    storeData as JobListingWithJobs[] | undefined,
  );

  useEffect(() => {
    console.log("jobListing", jobListing);
  }, [jobListing]);

  return (
    <ModuleCard
      id={jobListing.id}
      title={jobListing.title}
      subtitle={t("Pages.Jobs.title") + " " + String(jobListing.jobs_count)}
      currentStatus={jobListing.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(jobListing.id, "status", status)}
      onEdit={() => onActionClicked("edit", jobListing.id)}
      onDelete={() => onActionClicked("delete", jobListing.id)}
      onDuplicate={() => onActionClicked("duplicate", jobListing.id)}
      onPreview={() => onActionClicked("preview", jobListing.id)}
    >
      {jobListing.description && <p className="text-sm text-gray-600">{jobListing.description}</p>}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>
          {t("General.created_at")}: {new Date(jobListing.created_at).toLocaleDateString()}
        </span>
      </div>
    </ModuleCard>
  );
};

export default JobListingCard;
