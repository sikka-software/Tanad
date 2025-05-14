import { useTranslations } from "next-intl";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { useUpdateWebsite } from "@/website/website.hooks";
import useWebsiteStore from "@/website/website.store";
import { Website } from "@/website/website.type";

const WebsiteCard = ({
  website,
  onActionClicked,
}: {
  website: Website;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateWebsite } = useUpdateWebsite();
  const data = useWebsiteStore((state) => state.data);
  const setData = useWebsiteStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateWebsite({ id: rowId, data: { [columnId]: value } });
  };

  return (
    <ModuleCard
      id={website.id}
      title={website.domain_name}
      currentStatus={website.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(website.id, "status", status)}
      onEdit={() => onActionClicked("edit", website.id)}
      onDelete={() => onActionClicked("delete", website.id)}
      onDuplicate={() => onActionClicked("duplicate", website.id)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {t("Websites.form.created_at.label")}:{" "}
            {website.created_at ? new Date(website.created_at).toLocaleDateString() : "-"}
          </p>
          <p className="text-sm text-gray-500">
            {t("Websites.form.updated_at.label")}:{" "}
            {website.updated_at ? new Date(website.updated_at).toLocaleDateString() : "-"}
          </p>
        </div>
      </div>
    </ModuleCard>
  );
};

export default WebsiteCard;
