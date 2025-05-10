"use client";

import { Calendar, MapPin, Briefcase } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import { Job } from "@/job/job.type";

export default function JobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  const t = useTranslations();

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h3 className="text-foreground text-lg font-semibold">{job.title}</h3>
          <Badge variant={job.type === "Full-time" ? "default" : "outline"}>{job.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3 text-sm text-gray-500">
          <div className="flex items-center">
            <Briefcase className="me-2 h-4 w-4 text-gray-400" />
            <span>{job.department}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="me-2 h-4 w-4 text-gray-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="me-2 h-4 w-4 text-gray-400" />
            <span>{t("JobCard.posted", { date: job.created_at })}</span>
          </div>
        </div>
        <p className="mt-4 line-clamp-3 text-gray-600">{job.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onClick}>
          {t("JobCard.view_details")}
        </Button>
      </CardFooter>
    </Card>
  );
}
