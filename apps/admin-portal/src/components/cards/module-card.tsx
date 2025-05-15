import { Card, CardContent, CardHeader } from "@/ui/card";

import CardActions from "@/components/cards/card-actions";
import CardStatusAction from "@/components/cards/card-status-action";

import { cn } from "@/lib/utils";

import { CardActionsProps } from "@/types/common.type";

interface ModuleCardProps<T> extends CardActionsProps {
  id: string;
  title: string;
  subtitle?: string;
  currentStatus: T;
  statuses: T[];
  onStatusChange: (status: T) => void;
  // onEdit: () => void;
  // onDelete: () => void;
  // onDuplicate: () => void;
  children?: React.ReactNode;
  parentTranslationKey?: string;
}

const ModuleCard = <T,>({
  id,
  title,
  subtitle,
  currentStatus,
  statuses,
  onStatusChange,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  onArchive,
  onView,
  children,
  parentTranslationKey,
}: ModuleCardProps<T>) => {
  return (
    <Card
      key={id}
      className="group flex flex-col justify-between transition-shadow hover:shadow-lg"
    >
      <CardHeader className="flex flex-col items-start justify-between p-0">
        <div className="bg-muted flex w-full flex-row items-center justify-between gap-2 p-2">
          <CardStatusAction
            parentTranslationKey={parentTranslationKey}
            currentStatus={currentStatus}
            statuses={statuses}
            onStatusChange={onStatusChange}
          />
          <CardActions
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onPreview={onPreview}
            onArchive={onArchive}
            onView={onView}
          />
        </div>

        <div className={cn("flex items-start justify-between px-4 py-2", !children && "pb-3")}>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </CardHeader>
      {children && <CardContent className="px-4 pb-4">{children}</CardContent>}
    </Card>
  );
};

export default ModuleCard;
