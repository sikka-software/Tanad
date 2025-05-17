import { Mail, Phone, Globe, MapPin, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus, CommonStatusProps } from "@/types/common.type";

import { useUpdateCompany } from "@/company/company.hooks";
import useCompanyStore from "@/company/company.store";
import { Company } from "@/company/company.type";

const CompanyCard = ({
  company,
  onActionClicked,
}: {
  company: Company;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateCompany } = useUpdateCompany();
  const data = useCompanyStore((state) => state.data);
  const setData = useCompanyStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateCompany({ id: rowId, data: { [columnId]: value } });
  };

  return (
    <ModuleCard
      id={company.id}
      title={company.name}
      subtitle={company.industry || ""}
      currentStatus={company.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(company.id, "status", status)}
      onEdit={() => onActionClicked("edit", company.id)}
      onDelete={() => onActionClicked("delete", company.id)}
      onDuplicate={() => onActionClicked("duplicate", company.id)}
    >
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
                company.website.startsWith("http") ? company.website : `https://${company.website}`
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
            <span>
              {t("Companies.form.size.label")} {Number(company.size).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </ModuleCard>
  );
};

export default CompanyCard;
