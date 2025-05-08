import { Mail, MapPin, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";

import { Branch } from "@/branch/branch.type";

const BranchCard = ({ branch }: { branch: Branch }) => {
  const t = useTranslations("Branches");
  return (
    <Card key={branch.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{branch.name}</h3>
            <p className="text-sm text-gray-500">Code: {branch.code}</p>
          </div>
          <Badge variant={branch.status ? "default" : "secondary"}>
            {t(`status.${branch.status}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {branch.manager && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span>{branch.manager}</span>
            </div>
          )}
          {branch.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${branch.email}`} className="hover:text-primary">
                {branch.email}
              </a>
            </div>
          )}
          {branch.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4" />
              <a href={`tel:${branch.phone}`} className="hover:text-primary">
                {branch.phone}
              </a>
            </div>
          )}
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-1 h-4 w-4" />
            <div>
              <p>{branch.short_address}</p>
              <p>{`${branch.city}, ${branch.region} ${branch.zip_code}`}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BranchCard;
