import { Vehicle, VehicleCreateData, VehicleUpdateData } from "@/vehicle/vehicle.type";

export async function fetchVehicles(): Promise<Vehicle[]> {
  try {
    const response = await fetch("/api/resource/vehicles");
    if (!response.ok) {
      console.error("Failed to fetch vehicles:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return [];
  }
}

export async function fetchVehicleById(id: string): Promise<Vehicle> {
  const response = await fetch(`/api/resource/vehicles/${id}`);
  if (!response.ok) {
    throw new Error(`Vehicle with id ${id} not found`);
  }
  return response.json();
}

export async function createVehicle(vehicle: VehicleCreateData): Promise<Vehicle> {
  const response = await fetch("/api/resource/vehicles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vehicle),
  });

  if (!response.ok) {
    throw new Error("Failed to create vehicle");
  }

  return response.json();
}

export async function updateVehicle(id: string, vehicle: VehicleUpdateData): Promise<Vehicle> {
  const response = await fetch(`/api/resource/vehicles/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vehicle),
  });

  if (!response.ok) {
    throw new Error(`Failed to update vehicle with id ${id}`);
  }

  return response.json();
}

export async function duplicateVehicle(id: string): Promise<Vehicle> {
  const response = await fetch(`/api/resource/vehicles/${id}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to duplicate vehicle");
  }

  return response.json();
}
