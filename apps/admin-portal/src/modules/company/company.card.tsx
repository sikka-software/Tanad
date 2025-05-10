import { Mail, Phone, Globe, MapPin, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";

import { Company } from "@/company/company.type";

const CompanyCard = ({ company }: { company: Company }) => {
  const t = useTranslations();
  return (
    <Card key={company.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{company.name}</h3>
            {company.industry && <p className="text-sm text-gray-500">{company.industry}</p>}
          </div>
          <Badge variant={company.status === "active" ? "default" : "secondary"}>
            {t(`Companies.form.status.${company.status}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${company.email}`} className="hover:text-primary">
              {company.email}
            </a>
          </div>
          {company.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <a href={`tel:${company.phone}`} className="hover:text-primary">
                {company.phone}
              </a>
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4" />
              <a
                href={
                  company.website.startsWith("http")
                    ? company.website
                    : `https://${company.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                {company.website}
              </a>
            </div>
          )}
          {(company.building_number || company.street_name || company.city || company.region) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>
                {[company.building_number, company.street_name, company.city, company.region]
                  .filter(Boolean)
                  .join(", ")}
                {company.zip_code && ` ${company.zip_code}`}
              </span>
            </div>
          )}
          {company.size && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4" />
              <span>{company.size} employees</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
