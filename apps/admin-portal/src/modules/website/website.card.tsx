import { useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";

import { Website } from "./website.type";

const WebsiteCard = ({ website }: { website: Website }) => {
  const t = useTranslations();

  return (
    <Card key={website.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{website.domain_name}</h3>
            <p className="text-sm text-gray-500">
              {t("Websites.form.created_at.label")}:{" "}
              {website.created_at ? new Date(website.created_at).toLocaleDateString() : "-"}
            </p>
            <p className="text-sm text-gray-500">
              {t("Websites.form.updated_at.label")}:{" "}
              {website.updated_at ? new Date(website.updated_at).toLocaleDateString() : "-"}
            </p>
          </div>
          <Badge variant={website.status === "active" ? "default" : "secondary"}>
            {t(`Websites.form.status.${website.status}`)}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
};

export default WebsiteCard;
