import { MapPin, Code, LayoutGrid, NotebookText } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Warehouse } from "@/modules/warehouse/warehouse.type";

const WarehouseCard = ({ warehouse }: { warehouse: Warehouse }) => {
  const t = useTranslations("Warehouses");
  return (
    <Card key={warehouse.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{warehouse.name}</h3>
          <Badge variant={warehouse.is_active ? "default" : "secondary"}>
            {warehouse.is_active ? t("status.active") : t("status.inactive")}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Code className="h-4 w-4" />
          <span>{warehouse.code}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p>{warehouse.address}</p>
              <p>{`${warehouse.city}, ${warehouse.state} ${warehouse.zip_code}`}</p>
            </div>
          </div>
          {/* Capacity */}
          {warehouse.capacity && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <LayoutGrid className="h-4 w-4" />
              <span>{`${t("capacity")}: ${warehouse.capacity}`}</span>
            </div>
          )}
          {/* Notes */}
          {warehouse.notes && (
            <div className="flex items-start gap-2 border-t pt-3 text-sm text-gray-500">
              <NotebookText className="mt-1 h-4 w-4 flex-shrink-0" />
              <p className="whitespace-pre-wrap">{warehouse.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WarehouseCard;
