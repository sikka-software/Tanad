import { Mail, Phone, Building2, MapPin } from "lucide-react";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { Company } from "@/company/company.type";

import { useUpdateClient } from "@/client/client.hooks";
import useClientStore from "@/client/client.store";
import { Client } from "@/client/client.type";

const ClientCard = ({
  client,
  company,
  onActionClicked,
}: {
  client: Client;
  company: Company;
  onActionClicked: (action: string, id: string) => void;
}) => {
  const { mutate: updateClient } = useUpdateClient();
  const data = useClientStore((state) => state.data);
  const setData = useClientStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateClient({ id: rowId, data: { [columnId]: value } });
  };

  return (
    <ModuleCard
      id={client.id}
      title={client.name}
      subtitle={client?.email || ""}
      currentStatus={client.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(client.id, "status", status)}
      onEdit={() => onActionClicked("edit", client.id)}
      onDelete={() => onActionClicked("delete", client.id)}
      onDuplicate={() => onActionClicked("duplicate", client.id)}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Phone className="h-4 w-4" />
          <a href={`tel:${client.phone}`} className="hover:text-primary">
            {client.phone}
          </a>
        </div>
        {company?.name && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Building2 className="h-4 w-4" />
            <span>{company?.name}</span>
          </div>
        )}
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="mt-1 h-4 w-4" />
          <div>
            <p>
              {client.building_number} {client.street_name}
            </p>
            <p>
              {client.city} {client.region} {client.zip_code}
            </p>
          </div>
        </div>
      </div>
    </ModuleCard>
  );
};

export default ClientCard;
