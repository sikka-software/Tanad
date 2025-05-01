import { format } from "date-fns";
import { Calendar, DollarSign, MapPin, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";

import { Job } from "@/job/job.type";

const JobCard = ({ job }: { job: Job }) => {
  const t = useTranslations();
  return (
    <Card key={job.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.type}</p>
          </div>
          <Badge variant={job.is_active ? "default" : "secondary"}>
            {job.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {job.department && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4" />
              <span>{job.department}</span>
            </div>
          )}
          {job.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          )}
          {job.start_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Starts {format(new Date(job.start_date), "MMM dd, yyyy")}</span>
            </div>
          )}
          {job.salary && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>${job.salary.toLocaleString()}</span>
            </div>
          )}
          {job.description && (
            <p className="mt-2 line-clamp-2 border-t pt-2 text-sm text-gray-500">
              {job.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
