import { Purchase, PurchaseCreateData, PurchaseUpdateData } from "@/purchase/purchase.type";

export async function fetchPurchases(): Promise<Purchase[]> {
  try {
    const response = await fetch("/api/resource/purchases");
    if (!response.ok) {
      console.error("Failed to fetch purchases:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return [];
  }
}

export async function fetchPurchaseById(id: string): Promise<Purchase> {
  const response = await fetch(`/api/resource/purchases/${id}`);
  if (!response.ok) {
    throw new Error(`Purchase with id ${id} not found`);
  }
  return response.json();
}

export async function createPurchase(purchase: PurchaseCreateData): Promise<Purchase> {
  const response = await fetch("/api/resource/purchases", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(purchase),
  });

  if (!response.ok) {
    throw new Error("Failed to create purchase");
  }

  return response.json();
}

export async function updatePurchase(id: string, purchase: PurchaseUpdateData): Promise<Purchase> {
  const response = await fetch(`/api/resource/purchases/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(purchase),
  });

  if (!response.ok) {
    throw new Error(`Failed to update purchase with id ${id}`);
  }

  return response.json();
}

export async function duplicatePurchase(id: string): Promise<Purchase> {
  const response = await fetch(`/api/resource/purchases/${id}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to duplicate purchase");
  }

  return response.json();
}

export async function deletePurchase(id: string): Promise<void> {
  const response = await fetch(`/api/resource/purchases/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete purchase with id ${id}`);
  }
}

export async function bulkDeletePurchases(ids: string[]): Promise<void> {
  const response = await fetch("/api/resource/purchases", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete purchases");
  }
}
