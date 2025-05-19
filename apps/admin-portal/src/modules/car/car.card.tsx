import { useTranslations } from "next-intl";

import ModuleCard from "@/components/cards/module-card";

import { VehicleStatus, VehicleStatusProps } from "@/types/common.type";

import { useUpdateCar } from "@/car/car.hooks";
import useCarStore from "@/car/car.store";
import { Car } from "@/car/car.type";
import { CarUpdateData } from "@/car/car.type";

const CarCard = ({
  car,
  onActionClicked,
}: {
  car: Car;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateCar } = useUpdateCar();
  const data = useCarStore((state) => state.data);
  const setData = useCarStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateCar({ id: rowId, data: { [columnId]: value } as CarUpdateData });
  };

  return (
    <ModuleCard
      id={car.id}
      parentTranslationKey="Vehicles"
      title={car.name}
      subtitle={String(car.year)}
      currentStatus={car.status as VehicleStatusProps}
      statuses={Object.values(VehicleStatus) as VehicleStatusProps[]}
      onStatusChange={(status: VehicleStatusProps) => handleEdit(car.id, "status", status)}
      onEdit={() => onActionClicked("edit", car.id)}
      onDelete={() => onActionClicked("delete", car.id)}
      onDuplicate={() => onActionClicked("duplicate", car.id)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {t("make")}: {car.make} | {t("model")}: {car.model} | {t("year")}: {car.year}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {car.color && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{t("color")}:</span> {car.color}
          </div>
        )}
        {car.vin && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{t("vin")}:</span> {car.vin}
          </div>
        )}
        {car.license_plate && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{t("licensePlate")}:</span> {car.license_plate}
            {car.license_country && ` (${car.license_country})`}
          </div>
        )}
        {car.code && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{t("code")}:</span> {car.code}
          </div>
        )}
      </div>
    </ModuleCard>
  );
};

export default CarCard;
