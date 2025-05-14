import { useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";

import { Website } from "./website.type";

const WebsiteCard = ({ website }: { website: Website }) => {
  const t = useTranslations("Websites");
  return (
    <Card key={website.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{website.domain_name}</h3>  
            <p className="text-sm text-gray-500">Code: {website.domain_name}</p>
          </div>
          <Badge variant={website.status ? "default" : "secondary"}>
            {t(`status.${website.status}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Amount: {website.domain_name}</p>
          <p className="text-sm text-gray-500">Category: {website.domain_name}</p>
          <p className="text-sm text-gray-500">Due Date: {website.domain_name}</p>
          <p className="text-sm text-gray-500">Notes: {website.domain_name}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebsiteCard;
