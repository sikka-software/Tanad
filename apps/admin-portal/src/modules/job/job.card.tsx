import { format } from "date-fns";
import { Calendar, DollarSign, MapPin, Building2 } from "lucide-react";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus, CommonStatusProps } from "@/types/common.type";

import { useUpdateJob } from "@/job/job.hooks";
import useJobStore from "@/job/job.store";
import { Job, JobUpdateData } from "@/job/job.type";

const JobCard = ({
  job,
  onActionClicked,
}: {
  job: Job;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const { mutate: updateJob } = useUpdateJob();
  const data = useJobStore((state) => state.data);
  const setData = useJobStore((state) => state.setData);

  const handleEdit = createHandleEdit<Job, JobUpdateData>(setData, updateJob, data);

  return (
    <ModuleCard
      id={job.id}
      title={job.title}
      subtitle={String(job.type)}
      currentStatus={job.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(job.id, "status", status)}
      onEdit={() => onActionClicked("edit", job.id)}
      onDelete={() => onActionClicked("delete", job.id)}
      onDuplicate={() => onActionClicked("duplicate", job.id)}
    >
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
          <p className="mt-2 line-clamp-2 border-t pt-2 text-sm text-gray-500">{job.description}</p>
        )}
      </div>
    </ModuleCard>
  );
};

export default JobCard;
