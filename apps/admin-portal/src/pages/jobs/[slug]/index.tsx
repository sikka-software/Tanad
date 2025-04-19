import { Building2, MapPin, DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { JobListing } from "@/modules/job-listing/job-listing.type";
import { useJobs } from "@/modules/job/job.hooks";
import { Job } from "@/modules/job/job.type";

export default function JobListingPublicPage() {
  const t = useTranslations("Jobs");
  const router = useRouter();
  const { slug } = router.query;
  const { data: jobs } = useJobs();
  const [listing, setListing] = useState<JobListing | null>(null); // TODO: Replace with API call
  const [listingJobs, setListingJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (slug && jobs) {
      // TODO: Fetch job listing by slug
      // For now, we'll just show all jobs
      setListingJobs(jobs);
    }
  }, [slug, jobs]);

  const handleApply = (job_id: string) => {
    router.push(`/jobs/${job_id}/apply`);
  };

  return (
    <div className="container mx-auto py-8">
      {listing && (
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{listing.title}</h1>
          {listing.description && <p className="text-lg text-gray-600">{listing.description}</p>}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listingJobs.map((job: Job) => (
          <Card key={job.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.type}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {job.department && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{job.department}</span>
                  </div>
                )}
                {job.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.salary}</span>
                  </div>
                )}
              </div>
              {job.description && <p className="text-sm text-gray-600">{job.description}</p>}
              <Button className="w-full" onClick={() => handleApply(job.id)}>
                {t("Apply Now")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
