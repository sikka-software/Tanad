import { User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader } from "@/ui/card";

import { OnlineStore } from "./online-store.type";

const OnlineStoreCard = ({ onlineStore }: { onlineStore: OnlineStore }) => {
  const t = useTranslations("OnlineStores");
  return (
    <Card key={onlineStore.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{onlineStore.domain_name}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {onlineStore.notes && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="size-4" />
              <span>{onlineStore.notes}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnlineStoreCard;
