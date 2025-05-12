import { ModulesOptions } from "@root/tanad.config";
import { MoveVerticalIcon, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { StatCard } from "@/components/ui/stat-card";

import { convertToPascalCase } from "@/lib/utils";

import { DashboardStats } from "@/types/dashboard.types";

import useUserStore from "@/stores/use-user-store";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import IconButton from "../ui/icon-button";
import { Separator } from "../ui/separator";

const DashboardStatsVertical = ({
  stats,
  loadingStats,
}: {
  stats: DashboardStats;
  loadingStats: boolean;
}) => {
  const t = useTranslations();
  const hasPermission = useUserStore((state) => state.hasPermission);
  return (
    <div className="space-y-8 p-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(
          Object.entries(ModulesOptions).reduce(
            (acc, [key, module]) => {
              if (!module.category) {
                // If category is empty (e.g., "" or undefined)
                return acc; // Skip this module, don't add it to any category
              }
              const category = module.category; // Category is guaranteed to be a non-empty string here
              if (!acc[category]) {
                acc[category] = [];
              }
              // Add the original key to the module object for use in loops
              acc[category].push({ ...module, key });
              return acc;
            },
            {} as Record<string, Array<(typeof ModulesOptions)[string] & { key: string }>>,
          ),
        ).map(([categoryName, modulesInCategory]) => {
          // Filter modules that are not skipped and for which the user has permission
          const visibleModules = modulesInCategory.filter((module) => {
            const skippedModules = [
              "dashboard",
              "activity_logs",
              "analytics",
              "sales",
              "human_resources",
              "internet",
              "storage",
              "recruitment",
              "settings",
            ];
            if (skippedModules.includes(module.key)) return false;
            const permissionKey = `${module.key}.read`;
            return hasPermission(permissionKey);
          });
          if (visibleModules.length === 0) return null;
          return (
            <Card key={categoryName} className="max-w-xs">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  {t(`Pages.${categoryName.replace(/\s+/g, "_")}.title`) || categoryName}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {visibleModules.map((module, i) => {
                  const pascalKey = convertToPascalCase(module.key);
                  return (
                    <>
                      <div className="relative">
                        <div
                          key={module.key}
                          className="flex flex-row items-center justify-between gap-2"
                        >
                          <h3 className="text-sm font-medium">{t(module.translationKey)}</h3>
                          <p className="text-sm font-bold">
                            {stats[`total${pascalKey}` as keyof DashboardStats]}
                          </p>
                        </div>
                        <div className="absolute -end-10 top-1/2 flex -translate-y-1/2 items-center justify-center">
                          <Button
                            variant={"outline"}
                            size={"icon"}
                            className={"relative size-6 cursor-pointer"}
                            type={"button"}
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                      </div>
                      {i !== visibleModules.length - 1 && <Separator className="" />}
                    </>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardStatsVertical;
