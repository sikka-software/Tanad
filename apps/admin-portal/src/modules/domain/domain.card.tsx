import { Mail, MapPin, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";

import { Domain } from "@/modules/domain/domain.type";

const DomainCard = ({ domain }: { domain: Domain }) => {
  const t = useTranslations("Domains");
  return (
    <Card key={domain.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{domain.domain_name}</h3>
            <p className="text-sm text-gray-500">Registrar: {domain.registrar}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {domain.notes && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span>{domain.notes}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainCard;
