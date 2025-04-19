import { Mail, Phone, Building2, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Client } from "@/types/client.type";

const ClientCard = ({ client }: { client: Client }) => {
  return (
    <Card key={client.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">{client.name}</h3>
        <p className="text-sm text-gray-500">{client.company_details?.name || "Unknown Company"}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${client.email}`} className="hover:text-primary">
              {client.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4" />
            <a href={`tel:${client.phone}`} className="hover:text-primary">
              {client.phone}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Building2 className="h-4 w-4" />
            <span>{client.company_details?.name || "Unknown Company"}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-1 h-4 w-4" />
            <div>
              <p>{client.address}</p>
              <p>{`${client.city}, ${client.state} ${client.zip_code}`}</p>
            </div>
          </div>
          {client.notes && (
            <p className="mt-2 border-t pt-2 text-sm text-gray-500 dark:text-gray-400">
              {client.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;
