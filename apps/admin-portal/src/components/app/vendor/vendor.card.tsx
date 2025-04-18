import { Mail, Phone, MapPin, NotebookText } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Vendor } from "@/types/vendor.type";

const VendorCard = ({ vendor }: { vendor: Vendor }) => {
  const t = useTranslations("Vendors");
  return (
    <Card key={vendor.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">{vendor.name}</h3>
        {/* Display company if available */}
        {vendor.company && <p className="text-sm text-gray-500">{vendor.company}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Email */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${vendor.email}`} className="hover:text-primary">
              {vendor.email}
            </a>
          </div>
          {/* Phone */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4" />
            <a href={`tel:${vendor.phone}`} className="hover:text-primary">
              {vendor.phone}
            </a>
          </div>
          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p>{vendor.address}</p>
              <p>{`${vendor.city}, ${vendor.state} ${vendor.zip_code}`}</p>
            </div>
          </div>
          {/* Notes */}
          {vendor.notes && (
            <div className="flex items-start gap-2 border-t pt-3 text-sm text-gray-500 dark:text-gray-400">
              <NotebookText className="mt-1 h-4 w-4 flex-shrink-0" />
              <p className="whitespace-pre-wrap">{vendor.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
      {/* Consider adding Edit/Delete actions here if DataModelList doesn't handle it */}
    </Card>
  );
};

export default VendorCard;
