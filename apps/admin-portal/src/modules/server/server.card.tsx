import { Mail, MapPin, Phone } from "lucide-react";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { useUpdateServer } from "@/server/server.hooks";
import useServerStore from "@/server/server.store";
import { Server } from "@/server/server.type";

const ServerCard = ({
  server,
  onActionClicked,
}: {
  server: Server;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const { mutate: updateServer } = useUpdateServer();
  const data = useServerStore((state) => state.data);
  const setData = useServerStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateServer({ id: rowId, data: { [columnId]: value } });
  };

  return (
    <ModuleCard
      id={server.id}
      title={server.name}
      subtitle={String(server.ip_address) || ""}
      currentStatus={server.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(server.id, "status", status)}
      onEdit={() => onActionClicked("edit", server.id)}
      onDelete={() => onActionClicked("delete", server.id)}
      onDuplicate={() => onActionClicked("duplicate", server.id)}
    >
      <div className="space-y-3">
        {server.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>{server.location}</span>
          </div>
        )}
        {server.provider && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${server.provider}`} className="hover:text-primary">
              {server.provider}
            </a>
          </div>
        )}
        {typeof server.ip_address === "string" && server.ip_address && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4" />
            <a href={`tel:${server.ip_address}`} className="hover:text-primary">
              {server.ip_address}
            </a>
          </div>
        )}
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="mt-1 h-4 w-4" />
          <div>
            <p>{server.os}</p>
            <p>{server.provider}</p>
          </div>
        </div>
      </div>
    </ModuleCard>
  );
};

export default ServerCard;
