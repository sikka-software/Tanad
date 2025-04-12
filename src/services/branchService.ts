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
    zip_code: data.zipCode,
    phone: data.phone,
    email: data.email,
    manager: data.manager,
    is_active: data.isActive,
    notes: data.notes,
    created_at: data.createdAt?.toString() || "",
  };
}

export async function fetchBranches(): Promise<Branch[]> {
  try {
    const data = await db.query.branches.findMany({
      orderBy: desc(branches.createdAt),
    });
    return data.map(convertDrizzleBranch);
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
}

export async function fetchBranchById(id: string): Promise<Branch> {
  const data = await db.query.branches.findFirst({
    where: eq(branches.id, id),
  });

  if (!data) {
    throw new Error(`Branch with id ${id} not found`);
  }

  return convertDrizzleBranch(data);
}

export async function createBranch(branch: BranchCreateData): Promise<Branch> {
  // Map branch data to match Drizzle schema
  const dbBranch = {
    name: branch.name,
    code: branch.code,
    address: branch.address,
    city: branch.city,
    state: branch.state,
    zipCode: branch.zip_code,
    phone: branch.phone,
    email: branch.email,
    manager: branch.manager,
    isActive: branch.is_active,
    notes: branch.notes,
    userId: branch.userId,
  };

  const [data] = await db.insert(branches).values(dbBranch).returning();

  if (!data) {
    throw new Error("Failed to create branch");
  }

  return convertDrizzleBranch(data);
}

export async function updateBranch(
  id: string,
  branch: Partial<Omit<Branch, "id" | "created_at">>,
): Promise<Branch> {
  // Map branch data to match Drizzle schema
  const dbBranch = {
    ...branch,
    zipCode: branch.zip_code,
    isActive: branch.is_active,
  };

  const [data] = await db.update(branches).set(dbBranch).where(eq(branches.id, id)).returning();

  if (!data) {
    throw new Error(`Failed to update branch with id ${id}`);
  }

  return convertDrizzleBranch(data);
}

export async function deleteBranch(id: string): Promise<void> {
  await db.delete(branches).where(eq(branches.id, id));
}
