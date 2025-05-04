import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useTranslations } from "next-intl";
import Head from "next/head";
import { useRouter } from "next/router";

// Assuming AppLayout exists
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Separator } from "@/ui/separator";

// Ensure JobListing type handles nested jobs

import { createClient } from "@/utils/supabase/server-props";

// Assuming server client path
import { Job } from "@/job/job.type";

import { JobListing } from "@/job-listing/job-listing.type";

// Extend JobListing type locally if needed to clarify nested structure from query
type JobListingWithJobs = Omit<JobListing, "jobs"> & {
  job_listing_jobs: {
    jobs: Job; // Expecting full Job object nested here based on query
  }[];
};

interface JobListingPreviewProps {
  jobListing: JobListingWithJobs | null;
  error?: string;
}

export const getServerSideProps: GetServerSideProps<JobListingPreviewProps> = async (context) => {
  const { id } = context.params || {};
  const supabase = createClient(context);

  if (!id || typeof id !== "string") {
    return { notFound: true }; // Or handle invalid ID appropriately
  }

  try {
    // Fetch the job listing and nest the full job details through the junction table
    const { data, error } = await supabase
      .from("job_listings")
      .select(
        `
        *,
        job_listing_jobs (
          jobs ( * )
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      // Handle specific errors like not found (PGRST116) or others
      if (error.code === "PGRST116") {
        console.warn(`Job listing not found for ID: ${id}`);
        return { props: { jobListing: null } }; // Return null if not found
      }
      console.error(`Error fetching job listing ${id}:`, error);
      throw new Error(error.message); // Rethrow other errors
    }

    return {
      props: {
        jobListing: data as JobListingWithJobs, // Cast to the expected structure
      },
    };
  } catch (error: any) {
    console.error("Failed in getServerSideProps:", error);
    return {
      props: {
        jobListing: null,
        error: error.message || "Failed to load job listing.",
      },
    };
  }
};

export default function JobListingPreviewPage({
  jobListing,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const t = useTranslations();
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>; // Handle fallback state if using getStaticProps with fallback: true
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t("General.error_alert_title")}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!jobListing) {
    return (
      <Alert>
        <AlertTitle>{t("JobListings.preview.not_found_title")}</AlertTitle>
        <AlertDescription>{t("JobListings.preview.not_found_desc")}</AlertDescription>
      </Alert>
    );
  }

  // Extract jobs from the nested structure
  const jobs = jobListing.job_listing_jobs.map((j) => j.jobs);

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{jobListing.title}</CardTitle>
          <div className="flex items-center space-x-2 pt-2">
            <Badge variant={jobListing.is_active ? "default" : "outline"}>
              {jobListing.is_active ? t("Status.active") : t("Status.inactive")}
            </Badge>
            <Badge variant={jobListing.is_public ? "default" : "outline"}>
              {jobListing.is_public ? t("Visibility.public") : t("Visibility.private")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {jobListing.description && (
            <div className="prose dark:prose-invert max-w-none">
              <p>{jobListing.description}</p>
            </div>
          )}

          <Separator className="my-6" />

          <h2 className="mb-4 text-xl font-semibold">{t("JobListings.preview.associated_jobs")}</h2>
          {jobs && jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <div className="flex items-center space-x-2 pt-1">
                      {job.type && <Badge variant="secondary">{job.type}</Badge>}
                      {job.department && <Badge variant="outline">{job.department}</Badge>}
                      {job.location && <Badge variant="outline">{job.location}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {job.description && (
                      <p className="text-muted-foreground mb-2 text-sm">{job.description}</p>
                    )}
                    {job.requirements && (
                      <div>
                        <h4 className="mb-1 text-sm font-medium">
                          {t("Jobs.fields.requirements")}
                        </h4>
                        <p className="text-muted-foreground text-sm">{job.requirements}</p>
                      </div>
                    )}
                    {job.salary && (
                      <p className="mt-2 text-sm">
                        <strong>{t("Jobs.fields.salary")}:</strong> {job.salary}{" "}
                        {/* Add currency formatting if needed */}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("JobListings.preview.no_jobs")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
