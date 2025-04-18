import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { branches } from "@/db/schema";
import { Branch, BranchCreateData } from "@/types/branch.type";

// Helper to convert Drizzle branch to our Branch type
function convertDrizzleBranch(data: typeof branches.$inferSelect): Branch {
  return {
    id: data.id,
    name: data.name,
    code: data.code,
    address: data.address,
    city: data.city,
    state: data.state,
    zip_code: data.zip_code,
    phone: data.phone,
    email: data.email,
    manager: data.manager,
    is_active: data.is_active,
    notes: data.notes,
    created_at: data.created_at?.toString() || "",
  };
}

export async function fetchBranches(): Promise<Branch[]> {
  try {
    const response = await fetch("/api/branches");
    if (!response.ok) {
      throw new Error("Failed to fetch branches");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
}

export async function fetchBranchById(id: string): Promise<Branch> {
  const response = await fetch(`/api/branches/${id}`);
  if (!response.ok) {
    throw new Error(`Branch with id ${id} not found`);
  }
  return response.json();
}

export async function createBranch(branch: BranchCreateData): Promise<Branch> {
  const response = await fetch("/api/branches", {
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

export async function updateBranch(
  id: string,
  branch: Partial<Omit<Branch, "id" | "created_at">>,
): Promise<Branch> {
  const response = await fetch(`/api/branches/${id}`, {
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

export async function deleteBranch(id: string): Promise<void> {
  const response = await fetch(`/api/branches/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete branch with id ${id}`);
  }
}

export async function bulkDeleteBranches(ids: string[]): Promise<void> {
  const response = await fetch("/api/branches/bulk-delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete branches");
  }
}
