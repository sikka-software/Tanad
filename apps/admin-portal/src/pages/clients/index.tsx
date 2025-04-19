import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import ClientCard from "@/components/app/client/client.card";
import ClientsTable from "@/components/app/client/client.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import ConfirmDelete from "@/components/ui/confirm-delete";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import SelectionMode from "@/components/ui/selection-mode";

import { applySort } from "@/lib/sort-utils";

import { Client } from "@/types/client.type";

import { useClients, useBulkDeleteClients } from "@/hooks/models/useClients";
import { useClientsStore } from "@/stores/clients.store";

export default function ClientsPage() {
  const t = useTranslations();
  const { data: clients, isLoading, error } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [sortRules, setSortRules] = useState<{ field: string; direction: string }[]>([
    { field: "created_at", direction: "desc" },
  ]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [nullsFirst, setNullsFirst] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { selectedRows, setSelectedRows, clearSelection } = useClientsStore();
  const { mutate: deleteClients, isPending: isDeleting } = useBulkDeleteClients();

  const filteredClients = clients?.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.company_details?.name || "Unknown Company")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedClients = applySort("clients", filteredClients || [], sortRules, {
    caseSensitive,
    nullsFirst,
  });

  const sortableColumns = [
    { value: "created_at", label: t("General.created_at") },
    { value: "name", label: t("Clients.form.name.label") },
    { value: "email", label: t("Clients.form.email.label") },
    { value: "phone", label: t("Clients.form.phone.label") },
    { value: "company", label: t("Clients.form.company.label") },
    { value: "company_details.name", label: t("Clients.form.company_name.label") },
    { value: "address", label: t("Clients.form.address.label") },
    { value: "city", label: t("Clients.form.city.label") },
    { value: "state", label: t("Clients.form.state.label") },
    { value: "zip_code", label: t("Clients.form.zip_code.label") },
  ];

  const handleRowSelectionChange = (rows: Client[]) => {
    const newSelectedIds = rows.map((row) => row.id!);
    if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
      setSelectedRows(newSelectedIds);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteClients(selectedRows, {
        onSuccess: () => {
          clearSelection();
          setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => {
          console.error("Failed to delete clients:", error);
          toast.error(t("Clients.error.bulk_delete"));
          setIsDeleteDialogOpen(false);
        },
      });
    } catch (error) {
      console.error("Failed to delete clients:", error);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Clients.title")} description={t("Clients.description")} />
      <DataPageLayout>
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        ) : (
          <PageSearchAndFilter
            title={t("Clients.title")}
            createHref="/clients/add"
            createLabel={t("Clients.add_new")}
            onSearch={setSearchQuery}
            searchPlaceholder={t("Clients.search_clients")}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortRules={sortRules}
            onSortRulesChange={(value) => setSortRules(value)}
            sortableColumns={sortableColumns}
            caseSensitive={caseSensitive}
            onCaseSensitiveChange={(value) => setCaseSensitive(value)}
            nullsFirst={nullsFirst}
            onNullsFirstChange={(value) => setNullsFirst(value)}
          />
        )}
        <div>
          {viewMode === "table" ? (
            <ClientsTable
              key={`sorted-${sortedClients?.length}-${JSON.stringify(sortRules)}`}
              data={sortedClients || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              onSelectedRowsChange={handleRowSelectionChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedClients || []}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Clients.no_clients_found")}
                renderItem={(client) => <ClientCard client={client} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={handleConfirmDelete}
          title={t("Clients.confirm_delete_title")}
          description={t("Clients.confirm_delete", { count: selectedRows.length })}
        />
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
