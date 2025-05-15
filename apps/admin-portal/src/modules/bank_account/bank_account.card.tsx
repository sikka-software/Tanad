import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader } from "@/ui/card";

import { Car } from "@/modules/car/car.type";

const BankAccountCard = ({ car }: { car: Car }) => {
  const t = useTranslations("Cars");
  return (
    <Card key={car.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{car.name}</h3>
            <p className="text-sm text-gray-500">
              {t("make")}: {car.make} | {t("model")}: {car.model} | {t("year")}: {car.year}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default BankAccountCard;
