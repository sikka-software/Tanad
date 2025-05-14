import { Constants, Database } from "@/lib/database.types";

export const PurchaseStatus = Constants.public.Enums.purchase_status;
export type PurchaseStatusProps = (typeof PurchaseStatus)[number];

export type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
export type PurchaseCreateData = Database["public"]["Tables"]["purchases"]["Insert"];
export type PurchaseUpdateData = Database["public"]["Tables"]["purchases"]["Update"];
