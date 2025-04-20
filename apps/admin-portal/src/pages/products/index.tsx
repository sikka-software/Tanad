import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import ProductCard from "@/modules/product/product.card";
import { useProducts, useBulkDeleteProducts } from "@/modules/product/product.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/product/product.options";
import useProductStore from "@/modules/product/product.store";
import ProductsTable from "@/modules/product/product.table";

export default function ProductsPage() {
  const t = useTranslations();

  const viewMode = useProductStore((state) => state.viewMode);
  const isDeleteDialogOpen = useProductStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useProductStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useProductStore((state) => state.selectedRows);
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
  const { mutate: deleteProducts, isPending: isDeleting } = useBulkDeleteProducts();

  const filteredProducts = useMemo(() => {
    return getFilteredProducts(products || []);
  }, [products, getFilteredProducts, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedProducts = useMemo(() => {
    return getSortedProducts(filteredProducts);
  }, [filteredProducts, sortRules, sortCaseSensitive, sortNullsFirst]);

  const handleConfirmDelete = () => {
    if (selectedRows.length === 0) return;
    deleteProducts(selectedRows, {
      onSuccess: () => {
        clearSelection();
        setIsDeleteDialogOpen(false);
      },
      onError: (error: any) => {
        console.log("error is ", error);
        if (error?.error === "cant_delete_products_referenced") {
          const referencedIds = error.details.referencedProductIds;
          const referencedProducts =
            products
              ?.filter((p) => referencedIds.includes(p.id))
              .map((p) => p.name)
              .join(", ") || "";

          toast.error(t("Products.error.delete_referenced"), {
            description: t("Products.error.delete_referenced_description", {
              products: referencedProducts || t("General.unknown"),
            }),
          });
        } else {
          toast.error(t("Products.error.delete"), {
            description: t(`Products.error.${error.message}`),
          });
        }
        setIsDeleteDialogOpen(false);
      },
    });
  };

  return (
    <div>
      <CustomPageMeta title={t("Products.title")} description={t("Products.description")} />
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
            title={t("Products.title")}
            createHref="/products/add"
            createLabel={t("Products.add_new")}
            searchPlaceholder={t("Products.search_products")}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <ProductsTable
              data={sortedProducts}
              isLoading={isLoading}
              error={error as Error | null}
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

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={handleConfirmDelete}
          title={t("Products.confirm_delete_title")}
          description={t("Products.confirm_delete", { count: selectedRows.length })}
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
