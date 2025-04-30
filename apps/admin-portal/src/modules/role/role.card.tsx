import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { usePermission } from "@/hooks/use-permission";

import type { Role, RoleWithPermissions } from "./role.type";

interface RoleCardProps {
  role: RoleWithPermissions;
  onActionClick?: (action: string, id: string) => void;
  disableActions?: boolean;
}

export default function RoleCard({ role, onActionClick, disableActions = false }: RoleCardProps) {
  const t = useTranslations();
  const { hasPermission: canDeleteRoles } = usePermission("roles.delete");
  const { hasPermission: canUpdateRoles } = usePermission("roles.update");
  const { hasPermission: canCreateRoles } = usePermission("roles.create");

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{role.name}</CardTitle>
            <CardDescription>{role.description || t("Roles.no_description")}</CardDescription>
          </div>
          {!disableActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canUpdateRoles && (
                  <DropdownMenuItem onClick={() => onActionClick?.("edit", role.id)}>
                    {t("General.edit")}
                  </DropdownMenuItem>
                )}
                {canCreateRoles && (
                  <DropdownMenuItem onClick={() => onActionClick?.("duplicate", role.id)}>
                    {t("General.duplicate")}
                  </DropdownMenuItem>
                )}
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
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-medium">{t("Roles.permissions")}</h4>
            <div className="text-muted-foreground flex flex-wrap gap-1 text-sm">
              {role.permissions && role.permissions.length > 0 ? (
                role.permissions.map((perm) => (
                  <Badge key={perm} variant="secondary" className="font-normal">
                    {perm}
                  </Badge>
                ))
              ) : (
                <span>{t("Roles.no_permissions")}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
