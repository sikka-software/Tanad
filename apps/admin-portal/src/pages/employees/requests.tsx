import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import EmployeeRequestCard from "@/components/app/employee-request/employee-request.card";
import EmployeeRequestsTable from "@/components/app/employee-request/employee-request.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import { EmployeeRequest } from "@/types/employee-request.type";

import { useEmployeeRequests } from "@/hooks/useEmployeeRequests";

export default function EmployeeRequestsPage() {
  const t = useTranslations("EmployeeRequests");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const { data: requests, isLoading, error } = useEmployeeRequests();

  const filteredRequests = Array.isArray(requests)
    ? requests.filter(
        (request: EmployeeRequest) =>
          request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.status.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <DataPageLayout>
      <PageSearchAndFilter
        title={t("title")}
        createHref="/employees/requests/add"
        createLabel={t("add_new")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("search_requests")}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div>
        {viewMode === "table" ? (
          <EmployeeRequestsTable
            data={filteredRequests}
            isLoading={isLoading}
            error={error as Error | null}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredRequests}
              isLoading={isLoading}
              error={error as Error | null}
              emptyMessage={t("no_requests")}
              addFirstItemMessage={t("add_first_request")}
              renderItem={(request: EmployeeRequest) => (
                <EmployeeRequestCard employeeRequest={request} />
              )}
              gridCols="3"
            />
          </div>
        )}
      </div>
    </DataPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
