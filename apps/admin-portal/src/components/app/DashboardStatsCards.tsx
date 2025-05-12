import { ModulesOptions } from "@root/tanad.config";
import { useTranslations } from "next-intl";

import { StatCard } from "@/components/ui/stat-card";

import { convertToPascalCase } from "@/lib/utils";

import { DashboardStats } from "@/types/dashboard.types";

import useUserStore from "@/stores/use-user-store";

const DashboardCards = ({
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
      <div>
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
            <div key={categoryName} className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold capitalize">
                {/* You might want to translate category names too if they are dynamic */}
                {t(`Pages.${categoryName.replace(/\s+/g, "_")}.title`) || categoryName}
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {visibleModules.map((module) => {
                  const pascalKey = convertToPascalCase(module.key);
                  return (
                    <StatCard
                      key={module.key}
                      icon={<module.icon className="bg--500 m-0 size-4" />}
                      title={t(module.translationKey)}
                      value={stats[`total${pascalKey}` as keyof DashboardStats]}
                      loading={loadingStats}
                      link={module.url}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardCards;
