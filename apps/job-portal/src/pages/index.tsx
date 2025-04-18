import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import JobListings from "@/components/job-listings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Career Opportunities
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Join our team and help us build the future. We're looking for
            talented individuals who are passionate about making a difference.
          </p>
        </header>

        <JobListings />
      </div>
    </main>
  );
}
