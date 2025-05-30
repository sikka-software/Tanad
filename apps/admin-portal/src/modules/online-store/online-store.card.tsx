import { useTranslations } from "next-intl";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus, CommonStatusProps } from "@/types/common.type";

import { useUpdateOnlineStore } from "./online-store.hooks";
import useOnlineStoreStore from "./online-store.store";
import { OnlineStore, OnlineStoreUpdateData } from "./online-store.type";

const OnlineStoreCard = ({
  onlineStore,
  onActionClicked,
}: {
  onlineStore: OnlineStore;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateOnlineStore } = useUpdateOnlineStore();
  const data = useOnlineStoreStore((state) => state.data);
  const setData = useOnlineStoreStore((state) => state.setData);

  const handleEdit = createHandleEdit<OnlineStore, OnlineStoreUpdateData>(
    setData,
    updateOnlineStore,
    data,
  );

  return (
    <ModuleCard
      id={onlineStore.id}
      parentTranslationKey="OnlineStores"
      title={onlineStore.domain_name}
      subtitle={String(onlineStore.platform)}
      currentStatus={onlineStore.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(onlineStore.id, "status", status)}
      onEdit={() => onActionClicked("edit", onlineStore.id)}
      onDelete={() => onActionClicked("delete", onlineStore.id)}
      onDuplicate={() => onActionClicked("duplicate", onlineStore.id)}
    />
  );
};

export default OnlineStoreCard;
