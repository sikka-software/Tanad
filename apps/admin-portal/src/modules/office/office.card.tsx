import { Mail, Phone, MapPin, Building2 } from "lucide-react";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus, CommonStatusProps } from "@/types/common.type";

import { useUpdateOffice } from "@/office/office.hooks";
import useOfficeStore from "@/office/office.store";
import { Office, OfficeUpdateData } from "@/office/office.type";

const OfficeCard = ({
  office,
  onActionClicked,
}: {
  office: Office;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const { mutate: updateOffice } = useUpdateOffice();
  const data = useOfficeStore((state) => state.data);
  const setData = useOfficeStore((state) => state.setData);

  const handleEdit = createHandleEdit<Office, OfficeUpdateData>(setData, updateOffice, data);

  return (
    <ModuleCard
      id={office.id}
      title={office.name}
      subtitle={String(office.code)}
      currentStatus={office.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(office.id, "status", status)}
      onEdit={() => onActionClicked("edit", office.id)}
      onDelete={() => onActionClicked("delete", office.id)}
      onDuplicate={() => onActionClicked("duplicate", office.id)}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Mail className="h-4 w-4" />
          <a href={`mailto:${office.email}`} className="hover:text-primary">
            {office.email}
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Phone className="h-4 w-4" />
          <a href={`tel:${office.phone}`} className="hover:text-primary">
            {office.phone}
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Building2 className="h-4 w-4" />
          <span>
            {office.street_name} {office.building_number} {office.additional_number}
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="mt-1 h-4 w-4" />
          <div>
            <p>{`${office.city}, ${office.country} ${office.zip_code}`}</p>
          </div>
        </div>
      </div>
    </ModuleCard>
  );
};

export default OfficeCard;
