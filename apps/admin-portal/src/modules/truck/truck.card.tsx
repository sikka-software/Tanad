import { useTranslations } from "next-intl";

import ModuleCard from "@/components/cards/module-card";

import { VehicleStatus, VehicleStatusProps } from "@/types/common.type";

import { useUpdateTruck } from "@/truck/truck.hooks";
import useTruckStore from "@/truck/truck.store";
import { Truck, TruckUpdateData } from "@/truck/truck.type";

const TruckCard = ({
  truck,
  onActionClicked,
}: {
  truck: Truck;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateTruck } = useUpdateTruck();
  const data = useTruckStore((state) => state.data);
  const setData = useTruckStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateTruck({ id: rowId, data: { [columnId]: value } as TruckUpdateData });
  };

  return (
    <ModuleCard
      id={truck.id}
      title={truck.name}
      parentTranslationKey="Vehicles"
      subtitle={String(truck.year) || ""}
      currentStatus={truck.status as VehicleStatusProps}
      statuses={Object.values(VehicleStatus) as VehicleStatusProps[]}
      onStatusChange={(status: VehicleStatusProps) => handleEdit(truck.id, "status", status)}
      onEdit={() => onActionClicked("edit", truck.id)}
      onDelete={() => onActionClicked("delete", truck.id)}
      onDuplicate={() => onActionClicked("duplicate", truck.id)}
    >
      <div className="space-y-3">
        {truck.color && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{t("color")}:</span> {truck.color}
          </div>
        )}
        {truck.vin && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{t("vin")}:</span> {truck.vin}
          </div>
        )}
        {truck.license_plate && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{t("licensePlate")}:</span> {truck.license_plate}
            {truck.license_country && ` (${truck.license_country})`}
          </div>
        )}
        {truck.code && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{t("code")}:</span> {truck.code}
          </div>
        )}
      </div>
    </ModuleCard>
  );
};

export default TruckCard;
