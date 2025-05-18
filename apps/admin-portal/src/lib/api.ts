export async function bulkDeleteResource(
  url: string,
  ids: string[],
  options?: { cascade?: boolean },
): Promise<any> {
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, ...options }),
    });
    if (!response.ok) {
      throw new Error("Failed to delete resources");
    }
    return response.json();
  } catch (error) {
    console.error("Error deleting resources:", error);
    throw error;
  }
}

export async function deleteResourceById(endpoint: string): Promise<void> {
  const response = await fetch(endpoint, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete resource at ${endpoint}`);
  }
}
