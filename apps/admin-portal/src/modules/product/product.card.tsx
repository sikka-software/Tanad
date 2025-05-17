import { Mail, Phone, MapPin, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader } from "@/ui/card";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus, CommonStatusProps } from "@/types/common.type";

import { useUpdateOffice } from "@/office/office.hooks";
import useOfficeStore from "@/office/office.store";
import { Office } from "@/office/office.type";

import { Product } from "@/product/product.type";

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

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateProduct({ id: rowId, data: { [columnId]: value } });
  };

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
