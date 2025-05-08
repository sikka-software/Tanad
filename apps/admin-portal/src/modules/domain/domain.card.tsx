import { User } from "lucide-react";
import { useTranslations } from "next-intl";

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
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Status: {domain.status}</p>
          <p className="text-sm text-gray-500">Expires: {domain.payment_cycle}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainCard;
