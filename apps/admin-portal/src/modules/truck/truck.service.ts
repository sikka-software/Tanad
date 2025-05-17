import { Truck, TruckCreateData, TruckUpdateData } from "@/modules/truck/truck.type";

export async function fetchTrucks(): Promise<Truck[]> {
  try {
    const response = await fetch("/api/resource/trucks");
    if (!response.ok) {
      console.error("Failed to fetch trucks:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching trucks:", error);
    return [];
  }
}

export async function fetchTruckById(id: string): Promise<Truck> {
  const response = await fetch(`/api/resource/trucks/${id}`);
  if (!response.ok) {
    throw new Error(`Truck with id ${id} not found`);
  }
  return response.json();
}

export async function createTruck(truck: TruckCreateData): Promise<Truck> {
  const response = await fetch("/api/resource/trucks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(truck),
  });

  if (!response.ok) {
    throw new Error("Failed to create truck");
  }

  return response.json();
}

export async function updateTruck(id: string, truck: TruckUpdateData): Promise<Truck> {
  const response = await fetch(`/api/resource/trucks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(truck),
  });

  if (!response.ok) {
    throw new Error(`Failed to update truck with id ${id}`);
  }

  return response.json();
}

export async function duplicateTruck(id: string): Promise<Truck> {
  const response = await fetch(`/api/resource/trucks/${id}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to duplicate truck");
  }

  return response.json();
}
