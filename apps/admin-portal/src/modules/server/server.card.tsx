import { Mail, MapPin, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";

import { Server } from "@/modules/server/server.type";

const ServerCard = ({ server }: { server: Server }) => {
  const t = useTranslations("Servers");
  return (
    <Card key={server.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{server.name}</h3>
            <p className="text-sm text-gray-500">
              IP: {typeof server.ip_address === "string" ? server.ip_address : "N/A"}
            </p>
          </div>
          <Badge variant={server.status === "active" ? "default" : "secondary"}>
            {server.status === "active" ? t("status.active") : t("status.inactive")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {server.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{server.location}</span>
            </div>
          )}
          {server.provider && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${server.provider}`} className="hover:text-primary">
                {server.provider}
              </a>
            </div>
          )}
          {typeof server.ip_address === "string" && server.ip_address && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4" />
              <a href={`tel:${server.ip_address}`} className="hover:text-primary">
                {server.ip_address}
              </a>
            </div>
          )}
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-1 h-4 w-4" />
            <div>
              <p>{server.os}</p>
              <p>{server.provider}</p>
            </div>
          </div>
          {server.notes && (
            <p className="mt-2 border-t pt-2 text-sm text-gray-500 dark:text-gray-400">
              {server.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerCard;
