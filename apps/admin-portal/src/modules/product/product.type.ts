import { PRODUCT_CATEGORIES, PRODUCT_STATUSES } from "@/lib/constants/product-consts";

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  sku?: string | null;
  stock_quantity?: number | null;
  user_id: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ProductCreateData = Omit<Product, "id" | "created_at"> & { user_id: string };
export type ProductUpdateData = Partial<Product>;
