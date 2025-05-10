import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader } from "@/ui/card";

import { Truck } from "@/modules/truck/truck.type";

const TruckCard = ({ truck }: { truck: Truck }) => {
  const t = useTranslations("Trucks");
  return (
    <Card key={truck.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{truck.name}</h3>
            <p className="text-sm text-gray-500">
              {t("make")}: {truck.make} | {t("model")}: {truck.model} | {t("year")}: {truck.year}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default TruckCard;
