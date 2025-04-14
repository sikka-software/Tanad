import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import DataPageLayout from "@/components/layouts/data-page-layout";
import EmployeeRequestsTable from "@/components/tables/employee-requests-table";
import { Card, CardContent } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import { useEmployeeRequests } from "@/hooks/useEmployeeRequests";
import { EmployeeRequest } from "@/types/employee-request.type";

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

  const renderRequest = (request: EmployeeRequest) => (
    <Card key={request.id} className="transition-shadow hover:shadow-lg">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{request.title}</h3>
          <div className="space-x-2">
            <span className="text-sm text-gray-500">{request.type}</span>
            <span
              className={`inline-block rounded-full px-2 py-1 text-xs ${
                request.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : request.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {request.status}
            </span>
          </div>
        </div>
        <p className="mb-2 text-sm text-gray-600">{request.description || t("no_description")}</p>
        <div className="text-sm text-gray-500">
          <p>{t("employee_label", { name: request.employeeName })}</p>
          {request.startDate && (
            <p>
              {t("date_range", {
                start: new Date(request.startDate).toLocaleDateString(),
                end: request.endDate
                  ? new Date(request.endDate).toLocaleDateString()
                  : t("not_specified"),
              })}
            </p>
          )}
          {request.amount && <p>{t("amount_label", { amount: request.amount.toFixed(2) })}</p>}
        </div>
      </CardContent>
    </Card>
  );

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
              renderItem={renderRequest}
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
