import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { clients } from "@/db/schema";
import { Client, ClientCreateData } from "@/types/client.type";

// Helper to convert Drizzle client to our Client type
function convertDrizzleClient(data: typeof clients.$inferSelect): Client {
  return {
    id: data.id,
    name: data.name,
    email: data.email || "",
    phone: data.phone,
    company: data.company || "",
    address: data.address,
    city: data.city,
    state: data.state,
    zip_code: data.zipCode,
    notes: data.notes,
    created_at: data.createdAt?.toString() || "",
  };
}

export async function fetchClients(): Promise<Client[]> {
  try {
    const data = await db.query.clients.findMany({
      orderBy: desc(clients.createdAt),
    });
    return data.map(convertDrizzleClient);
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Failed to fetch clients");
  }
}

export async function fetchClientById(id: string): Promise<Client> {
  const data = await db.query.clients.findFirst({
    where: eq(clients.id, id),
  });

  if (!data) {
    throw new Error(`Client with id ${id} not found`);
  }

  return convertDrizzleClient(data);
}

export async function createClient(client: ClientCreateData) {
  // Map client data to match Drizzle schema
  const dbClient = {
    name: client.name,
    email: client.email,
    phone: client.phone,
    company: client.company,
    address: client.address,
    city: client.city,
    state: client.state,
    zipCode: client.zip_code,
    notes: client.notes,
    userId: client.userId || "", // Ensure userId is always a string
  };

  const [data] = await db.insert(clients).values(dbClient).returning();

  if (!data) {
    throw new Error("Failed to create client");
  }

  return convertDrizzleClient(data);
}

export async function updateClient(id: string, client: Partial<Client>) {
  // Convert snake_case to camelCase if zip_code is provided
  const dbClient = client.zip_code
    ? {
        ...client,
        zipCode: client.zip_code,
      }
    : client;

  const [data] = await db.update(clients).set(dbClient).where(eq(clients.id, id)).returning();

  if (!data) {
    throw new Error(`Failed to update client with id ${id}`);
  }

  return convertDrizzleClient(data);
}

export async function deleteClient(id: string) {
  await db.delete(clients).where(eq(clients.id, id));
}
