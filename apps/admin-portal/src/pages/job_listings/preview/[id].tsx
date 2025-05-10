import { JobListingNotFound } from "@root/src/components/app/job-listing-not-found";
import JobCard from "@root/src/components/jobs/job-card";
import JobDetailsModal from "@root/src/components/jobs/job-details-dialog";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useTranslations } from "next-intl";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";

import { createClient } from "@/utils/supabase/server-props";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Assuming server client path
import { Job } from "@/job/job.type";

import { JobListing } from "@/job-listing/job-listing.type";

// Extend JobListing type locally if needed to clarify nested structure from query
type JobListingWithJobs = Omit<JobListing, "jobs"> & {
  job_listing_jobs: {
    jobs: Job; // Expecting full Job object nested here based on query
  }[];
  enterprises: { name: string } | null; // Added to include enterprise data
};

interface JobListingPreviewProps {
  jobListing: JobListingWithJobs | null;
  enterpriseName?: string | null; // Allow null for enterpriseName
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
  enterpriseName, // Destructure enterpriseName
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const t = useTranslations();
  const router = useRouter();

  // State from job-listings.tsx
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null); // Use Job type

  if (router.isFallback) {
    return <div>{t("JobListingPreview.loading")}</div>; // Handle fallback state if using getStaticProps with fallback: true
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

  return (
    <main className="bg-background min-h-screen">
      <Head>
        {/* Add Head details if needed, e.g., listing title */}
        <title>
          {enterpriseName && jobListing?.title
            ? `${enterpriseName} | ${jobListing.title}`
            : jobListing?.title || t("Pages.JobListings.single")}
        </title>
        <meta
          name="description"
          content={jobListing.description || t("JobListingPreview.meta_description_default")}
        />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold">{jobListing.title}</h1>
          {jobListing.description && (
            <p className="text-muted-foreground max-w-2xl">{jobListing.description}</p>
          )}
          <div className="flex items-center space-x-2 pt-2">
            <Badge variant={jobListing.status === "active" ? "default" : "outline"}>
              {jobListing.status === "active" ? t("Status.active") : t("Status.inactive")}
            </Badge>
            <Badge variant={jobListing.is_public ? "default" : "outline"}>
              {jobListing.is_public ? t("Visibility.public") : t("Visibility.private")}
            </Badge>
          </div>
        </header>

        {/* Filter UI from job-listings.tsx */}
        <div className="bg-background border-border mb-8 rounded-lg border p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Input
                placeholder={t("Jobs.search_jobs") || "Search jobs..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
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
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder={t("JobListings.location_placeholder") || "Location"} />
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
            </div>
          </div>
        </div>

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

  let enterpriseName: string | null = null;

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
        .select("name")
        .eq("id", jobListingData.enterprise_id)
        .single();

      if (enterpriseError) {
        // Log error but don't fail the whole page if enterprise isn't found
        console.warn(
          `Could not fetch enterprise ${jobListingData.enterprise_id} for job listing ${id}:`,
          enterpriseError.message,
        );
      } else if (enterpriseData) {
        enterpriseName = enterpriseData.name;
      }
    }

    return {
      props: {
        jobListing: jobListingData as JobListingWithJobs,
        enterpriseName,
        messages: (await import(`../../../../locales/${context.locale}.json`)).default,
      },
    };
  } catch (error: any) {
    console.error("Failed in getServerSideProps:", error);
    return {
      props: {
        jobListing: null,
        enterpriseName: null,
        error: error.message || "Failed to load job listing.",
        messages: (await import(`../../../../locales/${context.locale}.json`)).default,
      },
    };
  }
};
