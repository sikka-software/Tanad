import { Mail, MapPin, Phone, User } from "lucide-react";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { useUpdateBranch } from "@/branch/branch.hooks";
import useBranchStore from "@/branch/branch.store";
import { Branch, BranchUpdateData } from "@/branch/branch.type";

const BranchCard = ({
  branch,
  onActionClicked,
}: {
  branch: Branch;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const { mutate: updateBranch } = useUpdateBranch();
  const data = useBranchStore((state) => state.data);
  const setData = useBranchStore((state) => state.setData);

  const handleEdit = createHandleEdit<Branch, BranchUpdateData>(setData, updateBranch, data);

  return (
    <ModuleCard
      id={branch.id}
      title={branch.name}
      subtitle={branch.code || ""}
      currentStatus={branch.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(branch.id, "status", status)}
      onEdit={() => onActionClicked("edit", branch.id)}
      onDelete={() => onActionClicked("delete", branch.id)}
      onDuplicate={() => onActionClicked("duplicate", branch.id)}
    >
      <div className="space-y-3">
        {branch.manager && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <User className="h-4 w-4" />
            <span>{branch.manager}</span>
          </div>
        )}
        {branch.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${branch.email}`} className="hover:text-primary">
              {branch.email}
            </a>
          </div>
        )}
        {branch.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4" />
            <a href={`tel:${branch.phone}`} className="hover:text-primary">
              {branch.phone}
            </a>
          </div>
        )}
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="mt-1 h-4 w-4" />
          <div>
            <p>{branch.short_address}</p>
            <p>{`${branch.city}, ${branch.region} ${branch.zip_code}`}</p>
          </div>
        </div>
      </div>
    </ModuleCard>
  );
};

export default BranchCard;
