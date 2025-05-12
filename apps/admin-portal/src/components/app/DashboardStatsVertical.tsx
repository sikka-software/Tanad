import { ModulesOptions } from "@root/tanad.config";
import { MoveVerticalIcon, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useState } from "react";

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
            <Card key={categoryName} className="h-fit max-w-xs">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  {t(`Pages.${categoryName.replace(/\s+/g, "_")}.title`) || categoryName}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-0 px-0 pb-0">
                {visibleModules.map((module, i) => {
                  const pascalKey = convertToPascalCase(module.key);
                  const [isHovered, setIsHovered] = useState(false);
                  const linkToAdd = module.url ? `${module.url}/add` : undefined;

                  return (
                    <React.Fragment key={module.key}>
                      <div
                        className="group relative"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      >
                        <Link href={module.url || "/dashboard"}>
                          <div className="flex flex-row items-center justify-between gap-2 px-6 py-4">
                            <h3 className="text-sm font-medium">{t(module.translationKey)}</h3>
                            <p className="text-sm font-bold">
                              {stats[`total${pascalKey}` as keyof DashboardStats]}
                            </p>
                          </div>
                        </Link>
                        <motion.div
                          initial={{ x: 16, opacity: 0 }}
                          animate={isHovered ? "hover" : "rest"}
                          variants={{
                            rest: { x: 16, opacity: 0 },
                            hover: { x: 0, opacity: 1 },
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="absolute -end-3 top-1/2 flex -translate-y-1/2 items-center justify-center group-hover:z-10"
                        >
                          <Link href={linkToAdd || "/dashboard"}>
                            <Button
                              variant={"outline"}
                              size={"icon"}
                              className={"relative size-7 cursor-pointer"}
                              type={"button"}
                            >
                              <Plus className="size-4" />
                            </Button>
                          </Link>
                        </motion.div>
                      </div>
                      {i !== visibleModules.length - 1 && <Separator className="" />}
                    </React.Fragment>
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
