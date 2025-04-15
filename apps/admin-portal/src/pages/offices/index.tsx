import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button";
import OfficesTable from "@/components/tables/offices-table";
import { useOffices } from "@/hooks/useOffices";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import { Plus } from "lucide-react";

export default function OfficesPage() {
  const t = useTranslations();
  const router = useRouter();
  const { data: offices, isLoading, error } = useOffices();

  return (
    <div className="container space-y-8 py-8">
      <PageSearchAndFilter
        title={t("offices.title")}
        createHref="/offices/new"
        createLabel={t("offices.actions.create")}
        searchPlaceholder={t("offices.search_placeholder")}
      />

      <OfficesTable data={offices || []} isLoading={isLoading} error={error} />
    </div>
  );
} 