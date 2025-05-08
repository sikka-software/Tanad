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
      <CardContent></CardContent>
    </Card>
  );
};

export default OnlineStoreCard;
