import { pick } from "lodash";
import { Package, Plus } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import FormDialog from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { createModuleStoreHooks } from "@/utils/module-hooks";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import ProductCard from "@/product/product.card";
import useProductColumns from "@/product/product.columns";
import { ProductForm } from "@/product/product.form";
import { useProducts, useBulkDeleteProducts, useDuplicateProduct } from "@/product/product.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/product/product.options";
import useProductStore from "@/product/product.store";
import ProductsTable from "@/product/product.table";
import { ProductUpdateData } from "@/product/product.type";

export default function ProductsPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useProductColumns();

  const moduleHooks = createModuleStoreHooks(useProductStore, "products");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableProduct, setActionableProduct] = useState<ProductUpdateData | null>(null);

  // Permissions
  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();
  // Loading
  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();
  // Delete Dialog
  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();
  const pendingDeleteIds = moduleHooks.usePendingDeleteIds();
  const setPendingDeleteIds = moduleHooks.useSetPendingDeleteIds();
  // Selected Rows
  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();
  const clearSelection = moduleHooks.useClearSelection();

  // Sorting
  const sortRules = moduleHooks.useSortRules();
  const sortCaseSensitive = moduleHooks.useSortCaseSensitive();
  const sortNullsFirst = moduleHooks.useSortNullsFirst();
  const setSortRules = moduleHooks.useSetSortRules();
  // Filtering
  const filterConditions = moduleHooks.useFilterConditions();
  const filterCaseSensitive = moduleHooks.useFilterCaseSensitive();
  const getFilteredData = moduleHooks.useGetFilteredData();
  const getSortedData = moduleHooks.useGetSortedData();
  // Misc
  const searchQuery = moduleHooks.useSearchQuery();
  const viewMode = moduleHooks.useViewMode();

  const { data: products, isLoading, error } = useProducts();
  const { mutateAsync: deleteProducts, isPending: isDeleting } = useBulkDeleteProducts();
  const { mutate: duplicateProduct } = useDuplicateProduct();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: products,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableProduct,
    duplicateMutation: duplicateProduct,
    moduleName: "Products",
  });

  const handleConfirmDelete = createDeleteHandler(deleteProducts, {
    loading: "Products.loading.delete",
    success: "Products.success.delete",
    error: "Products.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      if (
        error?.message?.includes("violates foreign key constraint") &&
        error?.message?.includes("invoice_items_product_id_fkey")
      ) {
        toast.error(t("General.error_operation"), {
          description: t("Products.error.delete_constraint_invoice"),
        });
        return true;
      }
      return false;
    },
  });

  const storeData = useProductStore((state) => state.data) || [];
  const setData = useProductStore((state) => state.setData);

  useEffect(() => {
    if (products && setData) {
      setData(products);
    }
  }, [products, setData]);

  const filteredProducts = useMemo(() => {
    return getFilteredData(storeData);
  }, [storeData, getFilteredData, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedProducts = useMemo(() => {
    return getSortedData(filteredProducts);
  }, [filteredProducts, sortRules, sortCaseSensitive, sortNullsFirst]);

  const tanstackSorting = useMemo(
    () => sortRules.map((rule) => ({ id: rule.field, desc: rule.direction === "desc" })),
    [sortRules],
  );
  const handleTanstackSortingChange = (
    updater:
      | ((prev: { id: string; desc: boolean }[]) => { id: string; desc: boolean }[])
      | { id: string; desc: boolean }[],
  ) => {
    let nextSorting = typeof updater === "function" ? updater(tanstackSorting) : updater;
    const newSortRules = nextSorting.map((s: { id: string; desc: boolean }) => ({
      field: s.id,
      direction: (s.desc ? "desc" : "asc") as "asc" | "desc",
    }));
    setSortRules(newSortRules);
  };

  if (!canRead) {
    return <NoPermission />;
  }

  useEffect(() => {
    setPendingDeleteIds(selectedRows);
  }, [selectedRows, setPendingDeleteIds]);

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.Products.title")}
        description={t("Pages.Products.description")}
      />
      <DataPageLayout count={products?.length} itemsText={t("Pages.Products.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useProductStore} isDeleting={isDeleting} />
        ) : (
          <PageSearchAndFilter
            store={useProductStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Products.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Products.add")}
            searchPlaceholder={t("Pages.Products.search")}
            hideOptions={products?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <ProductsTable
              data={sortedProducts}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
              sorting={tanstackSorting}
              onSortingChange={handleTanstackSortingChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedProducts}
                isLoading={isLoading}
                error={error}
                empty={{
                  title: t("Products.create_first.title"),
                  description: t("Products.create_first.description"),
                  add: t("Pages.Products.add"),
                  icons: [Package, Plus, Package],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(product) => (
                  <ProductCard product={product} onActionClicked={onActionClicked} />
                )}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableProduct ? t("Pages.Products.edit") : t("Pages.Products.add")}
          formId="product-form"
          loadingSave={loadingSave}
        >
          <ProductForm
            formHtmlId={"product-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableProduct(null);
              setLoadingSave(false);
            }}
            defaultValues={actionableProduct}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(pendingDeleteIds)}
          title={t("Products.confirm_delete", { count: selectedRows.length })}
          description={t("Products.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

ProductsPage.messages = [
  "Metadata",
  "Notes",
  "Pages",
  "Products",
  "Forms",
  "General",
  "CommonStatus",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        ProductsPage.messages,
      ),
    },
  };
};
