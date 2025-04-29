import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { usePermission } from "@/hooks/use-permission";
import type { Role } from "./role.type";

interface RoleCardProps {
  role: Role;
  onActionClick?: (action: string, id: string) => void;
}

export default function RoleCard({ role, onActionClick }: RoleCardProps) {
  const t = useTranslations();
  const { hasPermission: canDeleteRoles } = usePermission("roles.delete");

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{role.name}</CardTitle>
            <CardDescription>{role.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onActionClick?.("edit", role.id)}>
                {t("General.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onActionClick?.("duplicate", role.id)}>
                {t("General.duplicate")}
              </DropdownMenuItem>
              {canDeleteRoles && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onActionClick?.("delete", role.id)}
                >
                  {t("General.delete")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-medium">{t("Roles.permissions")}</h4>
            <p className="text-sm text-muted-foreground">
              {role.permissions ? JSON.stringify(role.permissions) : t("Roles.no_permissions")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 