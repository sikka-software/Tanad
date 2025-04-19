import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import ProductCard from "@/modules/product/product.card";
import ProductsTable from "@/modules/product/product.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { Product } from "@/modules/product/product.type";

import { useProducts, useBulkDeleteProducts } from "@/hooks/models/useProducts";
import useProductsStore from "@/modules/product/product.store";

export default function ProductsPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: products, isLoading, error } = useProducts();

  // Get selection state and actions from the store
  const { selectedRows, setSelectedRows, clearSelection } = useProductsStore();
  const { mutate: deleteProducts, isPending: isDeleting } = useBulkDeleteProducts();

  const filteredProducts = Array.isArray(products)
    ? products.filter(
        (product: Product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          product.sku?.toLowerCase()?.includes(searchQuery.toLowerCase()),
      )
    : [];

  const selectedProducts = selectedRows
    .map((id) => products?.find((prod) => prod.id === id))
    .filter((prod): prod is Product => prod !== undefined);

  const handleBulkDelete = () => {
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
            title={t("Products.title")}
            createHref="/products/add"
            createLabel={t("Products.add_new")}
            onSearch={setSearchQuery}
            searchPlaceholder={t("Products.search_products")}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <ProductsTable
              data={filteredProducts}
              isLoading={isLoading}
              error={error as Error | null}
              onSelectedRowsChange={(rows) => setSelectedRows(rows.map((r) => r.id))}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={filteredProducts}
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
          handleConfirmDelete={handleBulkDelete}
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
