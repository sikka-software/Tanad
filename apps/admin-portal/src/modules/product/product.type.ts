import { PRODUCT_CATEGORIES, PRODUCT_STATUSES } from "@/lib/constants/product-consts";
import { Database } from "@/lib/database.types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductCreateData = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdateData = Database["public"]["Tables"]["products"]["Update"];

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
