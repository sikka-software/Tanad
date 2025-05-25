import { useTranslations } from "next-intl";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus, CommonStatusProps } from "@/types/common.type";

import { useUpdateUser } from "@/user/user.hooks";
import useUserStore from "@/user/user.store";

import { UserType, UserUpdateData } from "./user.type";

const UserCard = ({
  user,
  onActionClicked,
}: {
  user: UserType;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateUser } = useUpdateUser();
  const data = useUserStore((state) => state.data);
  const setData = useUserStore((state) => state.setData);

  const handleEdit = createHandleEdit<UserType, UserUpdateData>(setData, updateUser, data);

  return (
    <ModuleCard
      id={user.id}
      title={user.full_name || ""}
      subtitle={user.email}
      // subtitle={String(user.email)}
      currentStatus={"active" as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(user.id, "status", status)}
      onEdit={() => onActionClicked("edit", user.id)}
      onDelete={() => onActionClicked("delete", user.id)}
      onDuplicate={() => onActionClicked("duplicate", user.id)}
    >
      <div className="space-y-2">
        {/* Remove Role display as user type doesn't contain role */}
        {/* <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">{t("Users.form.role.label")}</span>
            <Badge variant="outline">{user.role}</Badge>
          </div> */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">{t("Metadata.created_at.label")}</span>
          <span className="text-sm">{new Date(user.created_at || "").toLocaleDateString()}</span>
        </div>
      </div>
    </ModuleCard>
  );
};

export default UserCard;
