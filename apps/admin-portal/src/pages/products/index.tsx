import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import { FormDialog } from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import ProductCard from "@/product/product.card";
import { ProductForm } from "@/product/product.form";
import { useProducts, useBulkDeleteProducts, useDuplicateProduct } from "@/product/product.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/product/product.options";
import useProductStore from "@/product/product.store";
import ProductsTable from "@/product/product.table";
import { Product } from "@/product/product.type";

import useUserStore from "@/stores/use-user-store";

export default function ProductsPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadProducts = useUserStore((state) => state.hasPermission("products.read"));
  const canCreateProducts = useUserStore((state) => state.hasPermission("products.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableProduct, setActionableProduct] = useState<Product | null>(null);

  const loadingSaveProduct = useProductStore((state) => state.isLoading);
  const setLoadingSaveProduct = useProductStore((state) => state.setIsLoading);

  const viewMode = useProductStore((state) => state.viewMode);
  const isDeleteDialogOpen = useProductStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useProductStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useProductStore((state) => state.selectedRows);
  const setSelectedRows = useProductStore((state) => state.setSelectedRows);
  const clearSelection = useProductStore((state) => state.clearSelection);
  const sortRules = useProductStore((state) => state.sortRules);
  const sortCaseSensitive = useProductStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useProductStore((state) => state.sortNullsFirst);
  const searchQuery = useProductStore((state) => state.searchQuery);
  const filterConditions = useProductStore((state) => state.filterConditions);
  const filterCaseSensitive = useProductStore((state) => state.filterCaseSensitive);
  const getFilteredProducts = useProductStore((state) => state.getFilteredData);
  const getSortedProducts = useProductStore((state) => state.getSortedData);

  const { data: products, isLoading, error } = useProducts();
  const { mutateAsync: deleteProducts, isPending: isDeleting } = useBulkDeleteProducts();
  const { mutate: duplicateProduct } = useDuplicateProduct();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: products,
    setSelectedRows,
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

  const filteredProducts = useMemo(() => {
    return getFilteredProducts(products || []);
  }, [products, getFilteredProducts, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedProducts = useMemo(() => {
    return getSortedProducts(filteredProducts);
  }, [filteredProducts, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadProducts) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.Products.title")}
        description={t("Pages.Products.description")}
      />
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
            store={useProductStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Products.title")}
            onAddClick={canCreateProducts ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Products.add")}
            searchPlaceholder={t("Pages.Products.search")}
            count={products?.length}
            hideOptions={products?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <ProductsTable
              data={sortedProducts}
              isLoading={isLoading}
              error={error as Error | null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedProducts}
                isLoading={isLoading}
                error={error as Error | null}
                emptyMessage={t("Products.no_products")}
                addFirstItemMessage={t("Products.add_first_product")}
                renderItem={(product) => <ProductCard product={product} />}
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
          loadingSave={loadingSaveProduct}
        >
          <ProductForm
            formHtmlId={"product-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableProduct(null);
              setLoadingSaveProduct(false);
            }}
            defaultValues={actionableProduct as Product}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Products.confirm_delete_title")}
          description={t("Products.confirm_delete", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

ProductsPage.messages = ["Notes", "Pages", "Products", "Forms", "General"];

// export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
//   return {
//     props: {
//       messages: pick(
//         (await import(`../../../locales/${locale}.json`)).default,
//         ProductsPage.messages,
//       ),
//     },
//   };
// };
