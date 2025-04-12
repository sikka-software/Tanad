import { db } from "@/db/drizzle";
import { vendors } from "@/db/schema";
import { Vendor, VendorCreateData } from "@/types/vendor.type";
import { desc, eq } from "drizzle-orm";

// Helper to convert Drizzle vendor to our Vendor type
function convertDrizzleVendor(data: typeof vendors.$inferSelect): Vendor {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    address: data.address,
    city: data.city,
    state: data.state,
    zip_code: data.zipCode,
    notes: data.notes,
    created_at: data.createdAt?.toString() || ""
  };
}

export async function fetchVendors(): Promise<Vendor[]> {
  try {
    const data = await db.query.vendors.findMany({
      orderBy: desc(vendors.createdAt)
    });
    return data.map(convertDrizzleVendor);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    throw error;
  }
}

export async function fetchVendorById(id: string): Promise<Vendor> {
  const data = await db.query.vendors.findFirst({
    where: eq(vendors.id, id)
  });

  if (!data) {
    throw new Error(`Vendor with id ${id} not found`);
  }

  return convertDrizzleVendor(data);
}

export async function createVendor(vendorData: VendorCreateData): Promise<Vendor> {
  // Map vendor data to match Drizzle schema
  const dbVendorData = {
    name: vendorData.name,
    email: vendorData.email,
    phone: vendorData.phone,
    company: vendorData.company,
    address: vendorData.address,
    city: vendorData.city,
    state: vendorData.state,
    zipCode: vendorData.zip_code,
    notes: vendorData.notes,
    userId: vendorData.userId
  };

  const [data] = await db.insert(vendors)
    .values(dbVendorData)
    .returning();

  if (!data) {
    throw new Error("Failed to create vendor");
  }

  return convertDrizzleVendor(data);
}

export async function updateVendor(
  id: string,
  vendor: Partial<Omit<Vendor, "id" | "created_at">>,
): Promise<Vendor> {
  // Map vendor data to match Drizzle schema
  const dbVendor = vendor.zip_code ? {
    ...vendor,
    zipCode: vendor.zip_code
  } : vendor;

  const [data] = await db.update(vendors)
    .set(dbVendor)
    .where(eq(vendors.id, id))
    .returning();

  if (!data) {
    throw new Error(`Failed to update vendor with id ${id}`);
  }

  return convertDrizzleVendor(data);
}

export async function deleteVendor(id: string): Promise<void> {
  await db.delete(vendors)
    .where(eq(vendors.id, id));
}
