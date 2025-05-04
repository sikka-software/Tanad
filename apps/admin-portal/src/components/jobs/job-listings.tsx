"use client";

import { useRouter } from "next/router";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { JobListing } from "@/types";

import { useJobListing } from "../hooks/use-job-listing";
import { useJobs } from "../hooks/use-jobs";
import JobCard from "./job-card";
import JobDetailsModal from "./job-details-dialog";

export default function JobListings() {
  const router = useRouter();
  const { id } = router.query;
  const { data: jobs = [], isLoading: isLoadingJobs } = useJobs();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  // Get unique departments and locations for filters
  const departments = [...new Set(jobs.map((job) => job.department || "N/A"))];
  const locations = [...new Set(jobs.map((job) => job.location || "N/A"))];

  // Filter jobs based on search and filters
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

  // If we're on a detail page, show just that job
  if (id) {
    const { data: job, isLoading, error } = useJobListing(id as string);

    if (isLoading) {
      return (
        <div>
          <div className="bg-background mb-8 rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full py-12 text-center">
              <h3 className="mb-2 text-lg font-medium text-gray-900">Loading...</h3>
            </div>
          </div>
        </div>
      );
    }

    if (error || !job) {
      return (
        <div>
          <div className="bg-background mb-8 rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full py-12 text-center">
              <h3 className="mb-2 text-lg font-medium text-gray-900">Job not found</h3>
            </div>
          </div>
        </div>
      );
    }

    // Convert the database job to match the JobListing type
    const jobListing: JobListing = {
      id: job.id,
      title: job.title,
      description: job.description || "N/A",
      department: "N/A",
      location: "N/A",
      type: "N/A",
      postedDate: new Date().toISOString(),
      salary: "N/A",
      responsibilities: ["N/A"],
      requirements: ["N/A"],
      benefits: ["N/A"],
    };

    return (
      <div>
        <div className="bg-background border-border mb-8 rounded-lg border p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <JobCard key={job.id} job={jobListing} onClick={() => setSelectedJob(jobListing)} />
        </div>

        {selectedJob && (
          <JobDetailsModal
            job={selectedJob}
            isOpen={!!selectedJob}
            onClose={() => setSelectedJob(null)}
          />
        )}
      </div>
    );
  }

  if (isLoadingJobs) {
    return (
      <div>
        <div className="bg-background mb-8 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-full py-12 text-center">
            <h3 className="mb-2 text-lg font-medium text-gray-900">Loading...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-background mb-8 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
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
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <h3 className="mb-2 text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}
