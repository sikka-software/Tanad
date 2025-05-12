import CardActions from "@root/src/components/app/card-actions";
import { CommonStatus, CommonStatusProps } from "@root/src/types/common.type";
import { Mail, Phone, Globe, MapPin, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader } from "@/ui/card";

import CardStatusAction from "@/components/app/card-status-action";

import { Company } from "@/company/company.type";

import { useUpdateCompany } from "./company.hooks";

const CompanyCard = ({
  company,
  onActionClicked,
}: {
  company: Company;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateCompany } = useUpdateCompany();
  return (
    <Card key={company.id} className="transition-shadow hover:shadow-lg">
      <CardHeader className="bg--300 flex flex-col items-start justify-between px-2 pt-2">
        <div className="bg--200 flex w-full flex-row items-center justify-end gap-2">
          <CardStatusAction
            moduleName="Forms"
            currentStatus={company.status as CommonStatusProps}
            statuses={Object.values(CommonStatus) as CommonStatusProps[]}
            onStatusChange={(status: CommonStatusProps) =>
              updateCompany({ id: company.id, company: { status } })
            }
          />
          <CardActions
            onEdit={() => onActionClicked("edit", company.id)}
            onDelete={() => onActionClicked("delete", company.id)}
            onPreview={() => onActionClicked("preview", company.id)}
          />
        </div>

        <div className="flex items-start justify-between px-4">
          <div>
            <h3 className="text-lg font-semibold">{company.name}</h3>
            {company.industry && <p className="text-sm text-gray-500">{company.industry}</p>}
          </div>
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
