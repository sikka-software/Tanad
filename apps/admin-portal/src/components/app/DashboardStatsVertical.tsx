import NumberFlow from "@number-flow/react";
import { ModulesOptions, TanadModules } from "@tanad.config";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useState } from "react";

import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Separator } from "@/ui/separator";

import { cn, convertToPascalCase } from "@/lib/utils";

import { DashboardStats } from "@/types/dashboard.types";

import useUserStore from "@/stores/use-user-store";

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
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Object.entries(
          Object.entries(ModulesOptions).reduce(
            (acc, [key, module]) => {
              if (!module.category) {
                return acc;
              }
              const category = module.category;
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push({ ...module, key });
              return acc;
            },
            {} as Record<string, Array<(typeof ModulesOptions)[TanadModules] & { key: string }>>,
          ),
        )
          .reduce((acc, [categoryName, modulesInCategory], index) => {
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

            if (visibleModules.length === 0) return acc;

            const card = (
              <Card key={categoryName} className="h-auto max-w-xs">
                <CardHeader className="bg-muted rounded-t-md border-b p-2 sm:p-6">
                  <CardTitle className="text-md font-semibold select-none sm:text-2xl">
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
                            <div className="flex flex-row items-center justify-between gap-2 p-2 sm:px-6 sm:py-4">
                              <h3 className="text-sm font-medium">{t(module.translationKey)}</h3>
                              <p className={cn("text-sm font-bold", loadingStats && "blur-xs")}>
                                <NumberFlow
                                  value={Number(stats[`total${pascalKey}` as keyof DashboardStats])}
                                />
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

            const groupIndex = Math.floor(index / 2);
            if (!acc[groupIndex]) {
              acc[groupIndex] = [];
            }
            acc[groupIndex].push(card);
            return acc;
          }, [] as React.JSX.Element[][])
          .map((group, index) => (
            <div key={index} className="grid h-fit gap-4 select-none">
              {group}
            </div>
          ))}
      </div>
    </div>
  );
};

export default DashboardStatsVertical;
