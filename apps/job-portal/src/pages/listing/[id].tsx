import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import JobListings from "@/components/job-listings";
import { useRouter } from "next/router";
import { useJobListing } from "../../hooks/use-job-listing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();
  const { id } = router.query;
  const { data: job, isLoading, error } = useJobListing(id as string);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Loading...
            </h1>
          </header>
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Job Listing Not Found
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              The job listing you're looking for doesn't exist or has been
              removed.
            </p>
          </header>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Career Opportunities
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Join our team and help us build the future. We're looking for
            talented individuals who are passionate about making a difference.
          </p>
        </header>

        <JobListings />
      </div>
    </main>
  );
}
