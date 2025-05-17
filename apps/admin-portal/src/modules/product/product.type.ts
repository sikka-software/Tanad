import { PRODUCT_CATEGORIES } from "@/lib/constants/product-consts";
import { Database } from "@/lib/database.types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductCreateData = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdateData = Database["public"]["Tables"]["products"]["Update"];

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
