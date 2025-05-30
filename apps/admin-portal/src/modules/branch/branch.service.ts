import { Branch, BranchCreateData, BranchUpdateData } from "@/branch/branch.type";

export async function fetchBranches(): Promise<Branch[]> {
  try {
    const response = await fetch("/api/resource/branches");
    if (!response.ok) {
      console.error("Failed to fetch branches:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
}

export async function fetchBranchById(id: string): Promise<Branch> {
  const response = await fetch(`/api/resource/branches/${id}`);
  if (!response.ok) {
    throw new Error(`Branch with id ${id} not found`);
  }
  return response.json();
}

export async function createBranch(branch: BranchCreateData): Promise<Branch> {
  const response = await fetch("/api/resource/branches", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(branch),
  });

  if (!response.ok) {
    throw new Error("Failed to create branch");
  }

  return response.json();
}

export async function updateBranch(id: string, branch: BranchUpdateData): Promise<Branch> {
  const response = await fetch(`/api/resource/branches/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(branch),
  });

  if (!response.ok) {
    throw new Error(`Failed to update branch with id ${id}`);
  }

  return response.json();
}

export async function duplicateBranch(id: string): Promise<Branch> {
  const response = await fetch(`/api/resource/branches/${id}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to duplicate branch");
  }

  return response.json();
}
