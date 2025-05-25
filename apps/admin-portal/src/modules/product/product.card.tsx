import { useTranslations } from "next-intl";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus, CommonStatusProps } from "@/types/common.type";

import { Product, ProductUpdateData } from "@/product/product.type";

import { useUpdateProduct } from "./product.hooks";
import useProductStore from "./product.store";

const ProductCard = ({
  product,
  onActionClicked,
}: {
  product: Product;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateProduct } = useUpdateProduct();
  const data = useProductStore((state) => state.data);
  const setData = useProductStore((state) => state.setData);

  const handleEdit = createHandleEdit<Product, ProductUpdateData>(setData, updateProduct, data);

  return (
    <ModuleCard
      id={product.id}
      title={product.name}
      subtitle={product.description || ""}
      currentStatus={product.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(product.id, "status", status)}
      onEdit={() => onActionClicked("edit", product.id)}
      onDelete={() => onActionClicked("delete", product.id)}
      onDuplicate={() => onActionClicked("duplicate", product.id)}
    >
      <p className="text-lg font-bold">${Number(product.price).toFixed(2)}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t("sku_label", { value: product.sku || "N/A" })}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t("stock_label", {
          value: product.stock_quantity || 0,
        })}
      </p>
    </ModuleCard>
  );
};

export default ProductCard;
