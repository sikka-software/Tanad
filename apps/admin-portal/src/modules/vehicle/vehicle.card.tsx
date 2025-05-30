import { BusIcon, Bike, TruckIcon, CarIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";

import { VehicleStatus, VehicleStatusProps } from "@/types/common.type";

import { useUpdateVehicle } from "@/vehicle/vehicle.hooks";
import useVehicleStore from "@/vehicle/vehicle.store";
import { Vehicle, VehicleUpdateData } from "@/vehicle/vehicle.type";

const VehicleCard = ({
  vehicle,
  onActionClicked,
}: {
  vehicle: Vehicle;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateVehicle } = useUpdateVehicle();
  const data = useVehicleStore((state) => state.data);
  const setData = useVehicleStore((state) => state.setData);

  const handleEdit = createHandleEdit<Vehicle, VehicleUpdateData>(setData, updateVehicle, data);

  const vehicleTypeIcon = () => {
    switch (vehicle.vehicle_type) {
      case "car":
        return <CarIcon className="size-4" />;
      case "truck":
        return <TruckIcon className="size-4" />;
      case "bus":
        return <BusIcon className="size-4" />;
      case "motorcycle":
        return <Bike className="size-4" />;
    }
  };
  return (
    <ModuleCard
      id={vehicle.id}
      parentTranslationKey="Vehicles"
      title={
        <>
          {vehicleTypeIcon()} {vehicle.make}
        </>
      }
      subtitle={String(vehicle.year)}
      currentStatus={vehicle.status as VehicleStatusProps}
      statuses={Object.values(VehicleStatus) as VehicleStatusProps[]}
      onStatusChange={(status: VehicleStatusProps) => handleEdit(vehicle.id, "status", status)}
      onEdit={() => onActionClicked("edit", vehicle.id)}
      onDelete={() => onActionClicked("delete", vehicle.id)}
      onDuplicate={() => onActionClicked("duplicate", vehicle.id)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {t("make")}: {vehicle.make} | {t("model")}: {vehicle.model} | {t("year")}:{" "}
            {vehicle.year}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {vehicle.color && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{t("color")}:</span> {vehicle.color}
          </div>
        )}
        {vehicle.vin && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{t("vin")}:</span> {vehicle.vin}
          </div>
        )}
        {vehicle.license_plate && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{t("licensePlate")}:</span> {vehicle.license_plate}
            {vehicle.license_country && ` (${vehicle.license_country})`}
          </div>
        )}
        {vehicle.code && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{t("code")}:</span> {vehicle.code}
          </div>
        )}
      </div>
    </ModuleCard>
  );
};

export default VehicleCard;
