import { useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";

import { JobListingWithJobs } from "@/job-listing/job-listing.type";

const JobListingCard = ({ jobListing }: { jobListing: JobListingWithJobs }) => {
  const t = useTranslations();
  return (
    <Card key={jobListing.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
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
      </CardHeader>
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
    </Card>
  );
};

export default JobListingCard;
