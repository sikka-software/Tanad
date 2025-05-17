import { Car, CarCreateData, CarUpdateData } from "@/car/car.type";

export async function fetchCars(): Promise<Car[]> {
  try {
    const response = await fetch("/api/resource/cars");
    if (!response.ok) {
      console.error("Failed to fetch cars:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching cars:", error);
    return [];
  }
}

export async function fetchCarById(id: string): Promise<Car> {
  const response = await fetch(`/api/resource/cars/${id}`);
  if (!response.ok) {
    throw new Error(`Car with id ${id} not found`);
  }
  return response.json();
}

export async function createCar(car: CarCreateData): Promise<Car> {
  const response = await fetch("/api/resource/cars", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(car),
  });

  if (!response.ok) {
    throw new Error("Failed to create car");
  }

  return response.json();
}

export async function updateCar(id: string, car: CarUpdateData): Promise<Car> {
  const response = await fetch(`/api/resource/cars/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(car),
  });

  if (!response.ok) {
    throw new Error(`Failed to update car with id ${id}`);
  }

  return response.json();
}

export async function duplicateCar(id: string): Promise<Car> {
  const response = await fetch(`/api/resource/cars/${id}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to duplicate car");
  }

  return response.json();
}
