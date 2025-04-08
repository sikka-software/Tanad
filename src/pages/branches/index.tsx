import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import {
  Building2,
  Code,
  MapPin,
  Phone,
  Mail,
  User,
  NotebookText,
} from "lucide-react";

import type { Branch } from "@/types/branch.type";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageTitle from "@/components/ui/page-title";
import { useBranches } from "@/hooks/useBranches";
import { Badge } from "@/components/ui/badge";

export default function BranchesPage() {
  const t = useTranslations("Branches");
  const { data: branches, isLoading, error } = useBranches();

  // Render function for a single branch card
  const renderBranch = (branch: Branch) => (
    <Card key={branch.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{branch.name}</h3>
          <Badge variant={branch.is_active ? "default" : "secondary"}>
            {branch.is_active ? t("status.active") : t("status.inactive")}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Code className="h-4 w-4" />
          <span>{branch.code}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p>{branch.address}</p>
              <p>{`${branch.city}, ${branch.state} ${branch.zip_code}`}</p>
            </div>
          </div>
          {/* Contact Info */}
          {branch.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <a href={`tel:${branch.phone}`} className="hover:text-primary">
                {branch.phone}
              </a>
            </div>
          )}
          {branch.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${branch.email}`} className="hover:text-primary">
                {branch.email}
              </a>
            </div>
          )}
          {/* Manager */}
          {branch.manager && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{`${t("manager")}: ${branch.manager}`}</span>
            </div>
          )}
          {/* Notes */}
          {branch.notes && (
            <div className="flex items-start gap-2 border-t pt-3 text-sm text-gray-500">
              <NotebookText className="mt-1 h-4 w-4 flex-shrink-0" />
              <p className="whitespace-pre-wrap">{branch.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageTitle
        title={t("title")}
        createButtonLink="/branches/add"
        createButtonText={t("create_branch")}
        createButtonDisabled={isLoading}
      />
      <div className="p-4">
        <DataModelList
          data={branches}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
          emptyMessage={t("no_branches_found")}
          renderItem={renderBranch}
          gridCols="3"
        />
      </div>
    </div>
  );
}

// Add getStaticProps for translations
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const effectiveLocale = locale ?? 'en';
  return {
    props: {
      messages: (
        await import(`../../../locales/${effectiveLocale}.json`)
      ).default,
    },
  };
}; 