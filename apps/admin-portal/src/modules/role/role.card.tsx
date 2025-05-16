import { ChevronDown, MoreHorizontal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { ScrollArea } from "@/ui/scroll-area";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { convertToPascalCase } from "@/lib/utils";

import { app_permission } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

import { predefinedRoles } from "./role.options";
import type { Role } from "./role.type";

interface RoleCardProps {
  role: Role;
  onActionClick?: (action: string, id: string) => void;
  disableActions?: boolean;
}

const getAllPermissionsByCategory = () => {
  const grouped: Record<string, string[]> = {};
  app_permission.enumValues.forEach((perm) => {
    const [category] = perm.split(".");
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(perm);
  });
  return grouped;
};

const allPermissionsByCategory = getAllPermissionsByCategory();

export default function RoleCard({ role, onActionClick, disableActions = false }: RoleCardProps) {
  const t = useTranslations();
  const locale = useLocale();

  const canUpdateRoles = useUserStore((state) => state.hasPermission("roles.update"));
  const canDuplicateRoles = useUserStore((state) => state.hasPermission("roles.duplicate"));
  const canDeleteRoles = useUserStore((state) => state.hasPermission("roles.delete"));

  const assignedPermissionsByCategory = (role.permissions || []).reduce(
    (acc: Record<string, string[]>, perm: string) => {
      const [category] = perm.split(".");
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(perm);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {role.is_system ? predefinedRoles(t, role.name)?.name : role.name}
              {role.is_system && (
                <Badge variant="secondary" className="ms-2">
                  {t("Roles.predefined.system")}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {role.is_system
                ? predefinedRoles(t, role.name)?.description
                : role.description || null}
            </CardDescription>
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
                {canDuplicateRoles && (
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
        <div className="space-y-2 rounded-md bg-muted/20 border">
          <Accordion type="single" collapsible>
            <AccordionItem value="permissions">
              <AccordionTrigger className="bg-muted/50 hover:bg-muted cursor-pointer rounded-md p-2 text-sm font-medium no-underline hover:no-underline data-[state=open]:rounded-b-none">
                <div className="flex w-full flex-row items-center justify-between">
                  <span>{t("Roles.permissions.title")}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="text-muted-foreground flex flex-wrap gap-1 p-4 text-sm">
                  {Object.keys(allPermissionsByCategory).length > 0 ? (
                    Object.entries(allPermissionsByCategory)
                      .filter(([category]) => assignedPermissionsByCategory[category]?.length > 0)
                      .map(([category]) => {
                        const assignedPerms = assignedPermissionsByCategory[category] || [];
                        const assignedCount = assignedPerms.length;

                        const displayCategory = convertToPascalCase(category);
                        return (
                          <Popover key={category}>
                            <PopoverTrigger asChild>
                              <Badge variant="secondary" className="cursor-pointer font-normal">
                                {t(`Pages.${displayCategory}.title`)} ({assignedCount})
                              </Badge>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-fit p-0"
                              dir={locale === "ar" ? "rtl" : "ltr"}
                            >
                              <ScrollArea className="h-auto max-h-48">
                                <div className="p-4">
                                  <h5 className="mb-2 text-sm leading-none font-medium">
                                    {t(`Pages.${displayCategory}.title`)}
                                  </h5>
                                  <ul className="space-y-1 text-center text-xs">
                                    {assignedPerms.map((perm) => (
                                      <li key={perm}>
                                        {t(`Roles.permissions.${perm.split(".")[1]}`)}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </ScrollArea>
                            </PopoverContent>
                          </Popover>
                        );
                      })
                  ) : (
                    <span>{t("Roles.no_permissions")}</span>
                  )}
                  {(!role.permissions || role.permissions.length === 0) && (
                    <span>{t("Roles.no_permissions")}</span>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
