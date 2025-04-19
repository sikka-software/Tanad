import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Product } from "@/types/product.type";

const ProductCard = ({ product }: { product: Product }) => {
  const t = useTranslations("Products");
  return (
    <Card key={product.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">{product.name}</h3>
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-gray-600 dark:text-gray-400">
          {product.description || t("no_description")}
        </p>
        <p className="text-lg font-bold">${Number(product.price).toFixed(2)}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("sku_label", { value: product.sku || "N/A" })}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("stock_label", {
            value: product.stockQuantity || 0,
          })}
        </p>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
