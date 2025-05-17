import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Input } from "@/ui/inputs/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { createClient } from "@/utils/supabase/server-props";

import { JobListingNotFound } from "@/components/app/job-listing-not-found";
import JobCard from "@/components/jobs/job-card";
import JobDetailsModal from "@/components/jobs/job-details-dialog";
import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { JobListing } from "@/job-listing/job-listing.type";

// Assuming server client path
import { Job } from "@/job/job.type";

// Extend JobListing type locally if needed to clarify nested structure from query
type JobListingWithJobs = Omit<JobListing, "jobs"> & {
  job_listing_jobs: {
    jobs: Job; // Expecting full Job object nested here based on query
  }[];
  enterprises: { name: string } | null; // Added to include enterprise data
};

interface JobListingPreviewProps {
  jobListing: JobListingWithJobs | null;
  enterprise?: {
    name: string;
    logo: string;
  } | null; // Allow null for enterpriseName
  error?: string;
}

// --- Helper function to adapt Job to JobCard/Modal expected props ---
// Adjust this based on the actual props needed by JobCard and JobDetailsModal
// This might involve mapping fields or ensuring the components accept the 'Job' type.
// Example mapping (adjust fields as necessary):
const adaptJobForCard = (job: Job): any => ({
  // Use a more specific type if possible
  id: job.id,
  title: job.title,
  description: job.description || "N/A",
  department: job.department || "N/A",
  location: job.location || "N/A",
  type: job.type || "N/A",
  postedDate: job.created_at || new Date().toISOString(), // Use created_at or a default
  // Add other fields expected by JobCard/JobDetailsModal, mapping from 'Job'
  salary: job.salary?.toString() || "N/A", // Example: convert salary if needed
  requirements: job.requirements || "N/A", // Example: handle potentially null fields
  // responsibilities, benefits etc.
});

export default function JobListingPreviewPage({
  jobListing,
  error,
  enterprise, // Destructure enterprise
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  // State from job-listings.tsx
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null); // Use Job type

  if (router.isFallback) {
    return <div>{t("JobListingPreview.loading")}</div>;
  }

  if (!jobListing) {
    return <JobListingNotFound />;
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t("General.error_alert_title")}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Extract jobs from the nested structure
  const jobs: Job[] = jobListing?.job_listing_jobs.map((jlj) => jlj.jobs).filter(Boolean) || [];

  // Logic from job-listings.tsx for filters
  // Ensure departments/locations are derived correctly from the Job type
  const departments = [...new Set(jobs.map((job) => job.department || "N/A"))];
  const locations = [...new Set(jobs.map((job) => job.location || "N/A"))];

  // Filtering logic from job-listings.tsx, adapted for Job type
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" || (job.department || "N/A") === selectedDepartment;
    const matchesLocation =
      selectedLocation === "all" || (job.location || "N/A") === selectedLocation;

    return matchesSearch && matchesDepartment && matchesLocation;
  });

  const handleJobClick = (job: Job) => {
    setSelectedJob(job); // Set the DB Job type
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  console.log(jobListing);
  return (
    <main className="bg-background min-h-screen">
      <CustomPageMeta
        title={`${enterprise?.name} | ${jobListing.title}`}
        description={jobListing.description || t("JobListingPreview.meta_description_default")}
      />

      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex flex-row items-center gap-4">
            {enterprise?.logo && (
              <div>
                <Image
                  src={enterprise?.logo || ""}
                  alt={enterprise?.name || ""}
                  width={100}
                  height={100}
                  className="w-18 rounded-md object-cover object-center"
                />
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="text-foreground mb-2 text-3xl font-bold">{jobListing.title}</h1>
              {jobListing.description && (
                <p className="text-muted-foreground max-w-2xl">{jobListing.description}</p>
              )}
              <div className="flex items-center space-x-2 pt-2">
                <Badge
                  className="rounded-md"
                  variant={jobListing.status === "active" ? "default" : "outline"}
                >
                  {jobListing.status === "active" ? t("Status.active") : t("Status.inactive")}
                </Badge>
                <Badge
                  className="rounded-md"
                  variant={jobListing.is_public ? "default" : "outline"}
                >
                  {jobListing.is_public ? t("Visibility.public") : t("Visibility.private")}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Filter UI from job-listings.tsx */}
        {jobListing.enable_search_filtering && (
          <div className="bg--500 border-border mb-8 rounded-md border p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
              <div>
                <Input
                  placeholder={t("Pages.Jobs.search") || "Search jobs..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              {/* <div>
                <Select
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Jobs.department_placeholder") || "Department"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("Jobs.all_departments") || "All Departments"}
                    </SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("JobListings.location_placeholder") || "Location"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("JobListings.all_locations") || "All Locations"}
                    </SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}
            </div>
          </div>
        )}

        {/* Job Grid UI from job-listings.tsx */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={adaptJobForCard(job)}
                onClick={() => handleJobClick(job)}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <h3 className="text-foreground mb-2 text-lg font-medium">
                {t("JobListings.no_jobs_found") || "No jobs found"}
              </h3>
              <p className="text-muted-foreground">
                {t("JobListings.adjust_filters") || "Try adjusting your search or filters"}
              </p>
            </div>
          )}
        </div>

        {/* Job Details Modal */}
        {selectedJob && (
          <JobDetailsModal
            job={adaptJobForCard(selectedJob)}
            isOpen={!!selectedJob}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<JobListingPreviewProps> = async (context) => {
  const { id } = context.params || {};
  const supabase = createClient(context);

  if (!id || typeof id !== "string") {
    return { notFound: true };
  }

  let enterprise: {
    name: string;
    logo: string;
  } | null = null;

  try {
    // Step 1: Fetch the job listing
    const { data: jobListingData, error: jobListingError } = await supabase
      .from("job_listings")
      .select(
        `
        *,
        job_listing_jobs (
          jobs (
            *
          )
        )
      `,
      )
      .eq("id", id)
      .single();

    if (jobListingError) {
      if (jobListingError.code === "PGRST116") {
        console.warn(`Job listing not found for ID: ${id}`);
        return { props: { jobListing: null, enterpriseName: null } };
      }
      console.error(`Error fetching job listing ${id}:`, jobListingError);
      throw new Error(jobListingError.message);
    }

    // Step 2: If job listing is found and has an enterprise_id, fetch the enterprise name
    if (jobListingData && jobListingData.enterprise_id) {
      const { data: enterpriseData, error: enterpriseError } = await supabase
        .from("enterprises")
        .select("name, logo")
        .eq("id", jobListingData.enterprise_id)
        .single();

      if (enterpriseError) {
        // Log error but don't fail the whole page if enterprise isn't found
        console.warn(
          `Could not fetch enterprise ${jobListingData.enterprise_id} for job listing ${id}:`,
          enterpriseError.message,
        );
      } else if (enterpriseData) {
        let logoUrl = null;
        if (enterpriseData.logo) {
          const { data: signedData, error: signedError } = await supabase.storage
            .from("enterprise-images")
            .createSignedUrl(enterpriseData.logo, 60 * 60);
          if (signedData?.signedUrl) {
            logoUrl = signedData.signedUrl;
          }
        }
        enterprise = { name: enterpriseData.name, logo: logoUrl || "" };
      }
    }

    return {
      props: {
        jobListing: jobListingData as JobListingWithJobs,
        enterprise,
        messages: (await import(`../../../locales/${context.locale}.json`)).default,
      },
    };
  } catch (error: any) {
    console.error("Failed in getServerSideProps:", error);
    return {
      props: {
        jobListing: null,
        enterprise: null,
        error: error.message || "Failed to load job listing.",
        messages: (await import(`../../../locales/${context.locale}.json`)).default,
      },
    };
  }
};
