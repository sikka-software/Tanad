import { Phone, Building2, MapPin } from "lucide-react";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { useUpdateIndividual } from "./individual.hooks";
import useIndividualStore from "./individual.store";
import { Individual, IndividualUpdateData } from "./individual.type";

const IndividualCard = ({
  individual,
  onActionClicked,
}: {
  individual: Individual;
  onActionClicked: (action: string, id: string) => void;
}) => {
  const { mutate: updateIndividual } = useUpdateIndividual();
  const data = useIndividualStore((state) => state.data);
  const setData = useIndividualStore((state) => state.setData);

  const handleEdit = createHandleEdit<Individual, IndividualUpdateData>(
    setData,
    updateIndividual,
    data,
  );

  return (
    <ModuleCard
      id={individual.id}
      title={individual.name}
      subtitle={individual?.email || ""}
      currentStatus={individual.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(individual.id, "status", status)}
      onEdit={() => onActionClicked("edit", individual.id)}
      onDelete={() => onActionClicked("delete", individual.id)}
      onDuplicate={() => onActionClicked("duplicate", individual.id)}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Phone className="h-4 w-4" />
          <a href={`tel:${individual.phone}`} className="hover:text-primary">
            {individual.phone}
          </a>
        </div>
        {individual?.name && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Building2 className="h-4 w-4" />
            <span>{individual?.name}</span>
          </div>
        )}
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="mt-1 h-4 w-4" />
          <div>
            <p>
              {individual.building_number} {individual.street_name}
            </p>
            <p>
              {individual.city} {individual.region} {individual.zip_code}
            </p>
          </div>
        </div>
      </div>
    </ModuleCard>
  );
};

export default IndividualCard;
