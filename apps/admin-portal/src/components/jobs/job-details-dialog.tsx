"use client";

import { Calendar, MapPin, Briefcase, DollarSign } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Job } from "@/job/job.type";

import ApplicationForm from "../forms/job-application-form";

export default function JobDetailsModal({
  job,
  isOpen,
  onClose,
}: {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  if (!job) return null;
  const [activeTab, setActiveTab] = useState("details");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="max-h-[90vh] max-w-3xl overflow-y-auto"
      >
        <DialogHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">{job.title}</DialogTitle>
              <DialogDescription className="mt-1 flex flex-wrap gap-2">
                <span className="flex items-center text-sm text-gray-500">
                  <Briefcase className="me-1 h-4 w-4" /> {job.department}
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <MapPin className="me-1 h-4 w-4" /> {job.location}
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <Calendar className="me-1 h-4 w-4" />{" "}
                  {t("JobDetails.posted", { date: job.created_at })}
                </span>
                {job.salary && (
                  <span className="flex items-center text-sm text-gray-500">
                    <DollarSign className="me-1 h-4 w-4" /> {job.salary}
                  </span>
                )}
              </DialogDescription>
            </div>
            <Badge variant={job.type === "Full-time" ? "default" : "outline"} className="h-fit">
              {job.type}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4"
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">{t("JobDetails.job_details_tab")}</TabsTrigger>
            <TabsTrigger value="apply">{t("JobDetails.apply_now_tab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-medium">{t("JobDetails.overview")}</h3>
              <p className="text-gray-700">{job.description}</p>
            </div>

            {job.responsibilities && (
              <div>
                <h3 className="mb-2 text-lg font-medium">{t("JobDetails.responsibilities")}</h3>
                {job.responsibilities}
              </div>
            )}

            {job.requirements && (
              <div>
                <h3 className="mb-2 text-lg font-medium">{t("JobDetails.requirements")}</h3>
                {job.requirements}
              </div>
            )}

            {job.benefits && (
              <div>
                <h3 className="mb-2 text-lg font-medium">{t("JobDetails.benefits")}</h3>
                {job.benefits}
              </div>
            )}

            <div className="pt-4">
              <Button onClick={() => setActiveTab("apply")}>
                {t("JobDetails.apply_for_position_button")}
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
