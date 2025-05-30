import { createGenericStore } from "@/utils/generic-store";

import { Vehicle } from "./vehicle.type";

const searchVehicleFn = (vehicle: Vehicle, searchQuery: string) =>
  vehicle.make.toLowerCase().includes(searchQuery.toLowerCase());

const useVehicleStore = createGenericStore<Vehicle>("vehicles", searchVehicleFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useVehicleStore;
