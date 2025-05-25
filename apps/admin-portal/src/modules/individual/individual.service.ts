import { Individual, IndividualCreateData, IndividualUpdateData } from "./individual.type";

export async function fetchIndividuals(): Promise<Individual[]> {
  try {
    const response = await fetch("/api/resource/individuals");
    if (!response.ok) {
      console.error("Failed to fetch individuals:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching individuals:", error);
    return [];
  }
}

export async function fetchIndividualById(id: string): Promise<Individual> {
  const response = await fetch(`/api/resource/individuals/${id}`);
  if (!response.ok) {
    throw new Error(`Individual with id ${id} not found`);
  }
  return response.json();
}

export async function createIndividual(individual: IndividualCreateData): Promise<Individual> {
  const response = await fetch("/api/resource/individuals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(individual),
  });

  if (!response.ok) {
    throw new Error("Failed to create individual");
  }

  return response.json();
}

export async function updateIndividual(
  id: string,
  individual: IndividualUpdateData,
): Promise<Individual> {
  const response = await fetch(`/api/resource/individuals/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(individual),
  });

  if (!response.ok) {
    throw new Error(`Failed to update individual with id ${id}`);
  }

  return response.json();
}

export async function duplicateIndividual(id: string): Promise<Individual> {
  const response = await fetch(`/api/resource/individuals/${id}/duplicate`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to duplicate individual with id ${id}`);
  }

  return response.json();
}
