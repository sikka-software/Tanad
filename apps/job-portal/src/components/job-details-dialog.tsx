"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Briefcase, DollarSign } from "lucide-react";
import ApplicationForm from "@/components/application-form";
import { JobListing } from "@/data";

export default function JobDetailsModal({
  job,
  isOpen,
  onClose,
}: {
  job: JobListing;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!job) return null;
  const [activeTab, setActiveTab] = useState("details");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <DialogTitle className="text-xl font-bold">
                {job.title}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap gap-2 mt-1">
                <span className="flex items-center text-sm text-gray-500">
                  <Briefcase className="h-4 w-4 mr-1" /> {job.department}
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" /> {job.location}
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" /> Posted {job.postedDate}
                </span>
                {job.salary && (
                  <span className="flex items-center text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 mr-1" /> {job.salary}
                  </span>
                )}
              </DialogDescription>
            </div>
            <Badge
              variant={job.type === "Full-time" ? "default" : "outline"}
              className="h-fit"
            >
              {job.type}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Job Details</TabsTrigger>
            <TabsTrigger value="apply">Apply Now</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Overview</h3>
              <p className="text-gray-700">{job.description}</p>
            </div>

            {job.responsibilities && (
              <div>
                <h3 className="text-lg font-medium mb-2">Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {job.responsibilities.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.requirements && (
              <div>
                <h3 className="text-lg font-medium mb-2">Requirements</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {job.requirements.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.benefits && (
              <div>
                <h3 className="text-lg font-medium mb-2">Benefits</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {job.benefits.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4">
              <Button onClick={() => setActiveTab("apply")}>
                Apply for this position
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="apply" className="mt-4">
            <ApplicationForm jobTitle={job.title} onSubmitSuccess={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
