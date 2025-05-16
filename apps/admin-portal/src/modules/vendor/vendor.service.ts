import { Vendor, VendorCreateData, VendorUpdateData } from "@/vendor/vendor.type";

export async function fetchVendors(): Promise<Vendor[]> {
  try {
    const response = await fetch("/api/resource/vendors");
    if (!response.ok) {
      console.error("Failed to fetch vendors:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return [];
  }
}

export async function fetchVendorById(id: string): Promise<Vendor> {
  const response = await fetch(`/api/resource/vendors/${id}`);
  if (!response.ok) {
    throw new Error(`Vendor with id ${id} not found`);
  }
  return response.json();
}

export async function createVendor(vendor: VendorCreateData): Promise<Vendor> {
  const response = await fetch("/api/resource/vendors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vendor),
  });
  if (!response.ok) {
    throw new Error("Failed to create vendor");
  }
  return response.json();
}

export async function updateVendor(id: string, updates: VendorUpdateData): Promise<Vendor> {
  const response = await fetch(`/api/resource/vendors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error(`Failed to update vendor with id ${id}`);
  }
  return response.json();
}

export async function duplicateVendor(id: string): Promise<Vendor> {
  const response = await fetch(`/api/resource/vendors/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to duplicate vendor with id ${id}`);
  }
  return response.json();
}
