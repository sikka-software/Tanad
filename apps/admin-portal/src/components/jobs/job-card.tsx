"use client";

import { Calendar, MapPin, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { JobListing } from "@/data";

export default function JobCard({
  job,
  onClick,
}: {
  job: JobListing;
  onClick: () => void;
}) {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
          <Badge variant={job.type === "Full-time" ? "default" : "outline"}>
            {job.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3 text-sm text-gray-500">
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
            <span>{job.department}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>Posted {job.postedDate}</span>
          </div>
        </div>
        <p className="mt-4 text-gray-600 line-clamp-3">{job.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onClick}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
