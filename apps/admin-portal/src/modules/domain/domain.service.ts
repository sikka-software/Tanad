import { Domain, DomainCreateData, DomainUpdateData } from "@/modules/domain/domain.type";

export async function fetchDomains(): Promise<Domain[]> {
  try {
    const response = await fetch("/api/resource/domains");
    if (!response.ok) {
      console.error("Failed to fetch domains:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching domains:", error);
    return [];
  }
}

export async function fetchDomainById(id: string): Promise<Domain> {
  const response = await fetch(`/api/resource/domains/${id}`);
  if (!response.ok) {
    throw new Error(`Domain with id ${id} not found`);
  }
  return response.json();
}

export async function createDomain(domain: DomainCreateData): Promise<Domain> {
  const response = await fetch("/api/resource/domains", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(domain),
  });

  if (!response.ok) {
    throw new Error("Failed to create domain");
  }

  return response.json();
}

export async function updateDomain(id: string, domain: DomainUpdateData): Promise<Domain> {
  const response = await fetch(`/api/resource/domains/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(domain),
  });

  if (!response.ok) {
    throw new Error(`Failed to update domain with id ${id}`);
  }

  return response.json();
}

export async function duplicateDomain(id: string): Promise<Domain> {
  const response = await fetch(`/api/resource/domains/${id}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to duplicate domain");
  }

  return response.json();
}

export async function deleteDomain(id: string): Promise<void> {
  const response = await fetch(`/api/resource/domains/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete domain with id ${id}`);
  }
}

export async function bulkDeleteDomains(ids: string[]): Promise<void> {
  const response = await fetch("/api/resource/domains", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete domains");
  }
}
