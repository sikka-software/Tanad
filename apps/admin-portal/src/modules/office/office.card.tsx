import { Mail, Phone, MapPin, Building2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/ui/card";

import { Office } from "@/office/office.type";

const OfficeCard = ({ office }: { office: Office }) => {
  return (
    <Card key={office.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">{office.name}</h3>
        <p className="text-sm text-gray-500">{office.email || "Unknown Email"}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${office.email}`} className="hover:text-primary">
              {office.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4" />
            <a href={`tel:${office.phone}`} className="hover:text-primary">
              {office.phone}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Building2 className="h-4 w-4" />
            <span>{office.address}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-1 h-4 w-4" />
            <div>
              <p>{office.address}</p>
              <p>{`${office.city}, ${office.state} ${office.zip_code}`}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficeCard;
