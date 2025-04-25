// Remove Drizzle/DB imports as they are no longer used here
// import { db } from "@/db/drizzle";
// import { profiles } from "@/db/schema";
// import { sql } from 'drizzle-orm';

// Define the Role type - this should match the API response
export interface Role {
  id: string;
  name: string;
}

export async function fetchRoles(): Promise<Role[]> {
  console.log("Service: Calling /api/roles/list...");

  try {
    const response = await fetch('/api/roles/list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.message || `API Error: ${response.status} ${response.statusText}`;
      console.error("Fetch Roles API Error:", result);
      throw new Error(errorMessage);
    }

    console.log("Service: Received roles from API:", result);
    return result as Role[]; // Type assertion based on API contract

  } catch (error) {
    console.error("Error in fetchRoles service function:", error);
    // Rethrow or handle error as appropriate
    if (error instanceof Error) {
       throw new Error("Failed to fetch roles via API: " + error.message);
    }
    throw new Error("An unknown error occurred while fetching roles via API.");
  }
}

// Add other role service functions if needed (create, update, delete)
