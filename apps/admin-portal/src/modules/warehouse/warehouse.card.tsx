import { MapPin, LayoutGrid } from "lucide-react";
import { useTranslations } from "next-intl";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { useUpdateWarehouse } from "@/warehouse/warehouse.hooks";
import useWarehouseStore from "@/warehouse/warehouse.store";
import { Warehouse, WarehouseUpdateData } from "@/warehouse/warehouse.type";

const WarehouseCard = ({
  warehouse,
  onActionClicked,
}: {
  warehouse: Warehouse;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateWarehouse } = useUpdateWarehouse();
  const data = useWarehouseStore((state) => state.data);
  const setData = useWarehouseStore((state) => state.setData);

  const handleEdit = createHandleEdit<Warehouse, WarehouseUpdateData>(
    setData,
    updateWarehouse,
    data,
  );

  return (
    <ModuleCard
      id={warehouse.id}
      title={warehouse.name}
      subtitle={warehouse.code || ""}
      currentStatus={warehouse.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(warehouse.id, "status", status)}
      onEdit={() => onActionClicked("edit", warehouse.id)}
      onDelete={() => onActionClicked("delete", warehouse.id)}
      onDuplicate={() => onActionClicked("duplicate", warehouse.id)}
    >
      <div className="space-y-3">
        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
          <div>
            <p>
              {warehouse.building_number} {warehouse.street_name}
            </p>
            <p>
              {warehouse.city} {warehouse.region} {warehouse.zip_code}
            </p>
          </div>
        </div>
        {/* Capacity */}
        {warehouse.capacity && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <LayoutGrid className="h-4 w-4" />
            <span>{`${t("capacity")}: ${warehouse.capacity}`}</span>
          </div>
        )}
      </div>
    </ModuleCard>
  );
};

export default WarehouseCard;
