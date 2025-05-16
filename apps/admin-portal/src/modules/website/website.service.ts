import { Website, WebsiteCreateData, WebsiteUpdateData } from "./website.type";

export async function fetchWebsites(): Promise<Website[]> {
  try {
    const response = await fetch("/api/resource/websites");
    if (!response.ok) {
      console.error("Failed to fetch websites:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching websites:", error);
    return [];
  }
}

export async function fetchWebsiteById(id: string): Promise<Website> {
  const response = await fetch(`/api/resource/websites/${id}`);
  if (!response.ok) {
    throw new Error(`Website with id ${id} not found`);
  }
  return response.json();
}

export async function createWebsite(website: WebsiteCreateData): Promise<Website> {
  const response = await fetch("/api/resource/websites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(website),
  });

  if (!response.ok) {
    throw new Error("Failed to create website");
  }

  return response.json();
}

export async function updateWebsite(id: string, website: WebsiteUpdateData): Promise<Website> {
  const response = await fetch(`/api/resource/websites/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(website),
  });

  if (!response.ok) {
    throw new Error(`Failed to update website with id ${id}`);
  }

  return response.json();
}

export async function duplicateWebsite(id: string): Promise<Website> {
  const response = await fetch(`/api/resource/websites/${id}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to duplicate website");
  }

  return response.json();
}
