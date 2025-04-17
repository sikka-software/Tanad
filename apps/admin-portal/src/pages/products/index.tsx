import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { Trash2, X } from "lucide-react";
import { toast } from "sonner";

import ProductCard from "@/components/app/product/product.card";
import ProductsTable from "@/components/app/product/product.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import { Button } from "@/components/ui/button";
import ConfirmDelete from "@/components/ui/confirm-delete";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import { Product } from "@/types/product.type";

import { useProducts, useBulkDeleteProducts } from "@/hooks/useProducts";
import { useProductsStore } from "@/stores/products.store";

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
        if (error?.response?.data?.error === "Cannot delete products that are used in quotes") {
          const referencedIds = error.response.data.details.referencedProductIds;
          const referencedProducts = products
            ?.filter((p) => referencedIds.includes(p.id))
            .map((p) => p.name)
            .join(", ") || "";
          
          toast.error(t("Products.error.delete_referenced"), {
            description: t("Products.error.delete_referenced_description", {
              products: referencedProducts || t("General.unknown"),
            }),
          });
        } else {
          toast.error(t("General.error_operation"), {
            description: error.message || t("Products.error.delete"),
          });
        }
        setIsDeleteDialogOpen(false);
      },
    });
  };

  return (
    <DataPageLayout>
      {selectedRows.length > 0 ? (
        <div className="bg-background sticky top-0 z-10 flex !min-h-12 items-center justify-between gap-4 border-b px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedRows.length} {t("General.items_selected")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="flex items-center gap-2"
              disabled={isDeleting}
            >
              <X className="h-4 w-4" />
              {t("General.clear")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-2"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {t("General.delete")}
            </Button>
          </div>
        </div>
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
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
