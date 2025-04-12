import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { Building2, Mail, Phone, MapPin, User } from "lucide-react";

import BranchesTable from "@/components/tables/branches-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import { useBranches } from "@/hooks/useBranches";
import { Branch } from "@/types/branch.type";

export default function BranchesPage() {
  const t = useTranslations("Branches");
  const { data: branches, isLoading, error } = useBranches();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredBranches = branches?.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (branch.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (branch.manager?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  );

  const renderBranch = (branch: Branch) => (
    <Card key={branch.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{branch.name}</h3>
            <p className="text-sm text-gray-500">Code: {branch.code}</p>
          </div>
          <Badge variant={branch.is_active ? "default" : "secondary"}>
            {branch.is_active ? t("status.active") : t("status.inactive")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {branch.manager && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span>{branch.manager}</span>
            </div>
          )}
          {branch.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${branch.email}`} className="hover:text-primary">
                {branch.email}
              </a>
            </div>
          )}
          {branch.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4" />
              <a href={`tel:${branch.phone}`} className="hover:text-primary">
                {branch.phone}
              </a>
            </div>
          )}
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-1 h-4 w-4" />
            <div>
              <p>{branch.address}</p>
              <p>{`${branch.city}, ${branch.state} ${branch.zip_code}`}</p>
            </div>
          </div>
          {branch.notes && (
            <p className="mt-2 border-t pt-2 text-sm text-gray-500 dark:text-gray-400">
              {branch.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageSearchAndFilter
        title={t("title")}
        createHref="/branches/add"
        createLabel={t("add_new")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("search_branches")}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div>
        {viewMode === "table" ? (
          <BranchesTable 
            data={filteredBranches || []} 
            isLoading={isLoading} 
            error={error instanceof Error ? error : null} 
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredBranches || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              emptyMessage={t("no_branches_found")}
              renderItem={renderBranch}
              gridCols="3"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
