import { Constants } from "@/lib/database.types";

export const VehicleOwnershipStatus = Constants.public.Enums.vehicle_ownership_status;
export type VehicleOwnershipStatusProps = (typeof VehicleOwnershipStatus)[number];
