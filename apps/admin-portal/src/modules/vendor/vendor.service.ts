import { Vendor, VendorCreateData } from "@/modules/vendor/vendor.type";

export async function fetchVendors(): Promise<Vendor[]> {
  try {
    const response = await fetch("/api/vendors");
    if (!response.ok) {
      throw new Error("Failed to fetch vendors");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching vendors:", error);
    throw error;
  }
}

export async function fetchVendorById(id: string): Promise<Vendor> {
  const response = await fetch(`/api/vendors/${id}`);
  if (!response.ok) {
    throw new Error(`Vendor with id ${id} not found`);
  }
  return response.json();
}

export async function createVendor(vendorData: VendorCreateData): Promise<Vendor> {
  const response = await fetch("/api/vendors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vendorData),
  });

  if (!response.ok) {
    throw new Error("Failed to create vendor");
  }

  return response.json();
}

export async function updateVendor(
  id: string,
  vendor: Partial<Omit<Vendor, "id" | "created_at">>,
): Promise<Vendor> {
  const response = await fetch(`/api/vendors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vendor),
  });

  if (!response.ok) {
    throw new Error(`Failed to update vendor with id ${id}`);
  }

  return response.json();
}

export async function deleteVendor(id: string): Promise<void> {
  const response = await fetch(`/api/vendors/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete vendor with id ${id}`);
  }
}
