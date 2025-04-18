import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";

import EmployeeRequestCard from "@/components/app/employee-request/employee-request.card";
import EmployeeRequestsTable from "@/components/app/employee-request/employee-request.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { EmployeeRequest } from "@/types/employee-request.type";

import { useEmployeeRequests } from "@/hooks/useEmployeeRequests";

export default function EmployeeRequestsPage() {
  const t = useTranslations();
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
    <div>
      <CustomPageMeta
        title={t("EmployeeRequests.title")}
        description={t("EmployeeRequests.description")}
      />
      <DataPageLayout>
        <PageSearchAndFilter
          title={t("EmployeeRequests.title")}
          createHref="/employee-requests/add"
          createLabel={t("EmployeeRequests.add_new")}
          onSearch={setSearchQuery}
          searchPlaceholder={t("EmployeeRequests.search_requests")}
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
                emptyMessage={t("EmployeeRequests.no_requests")}
                addFirstItemMessage={t("EmployeeRequests.add_first_request")}
                renderItem={(request: EmployeeRequest) => (
                  <EmployeeRequestCard employeeRequest={request} />
                )}
                gridCols="3"
              />
            </div>
          )}
        </div>
      </DataPageLayout>
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
