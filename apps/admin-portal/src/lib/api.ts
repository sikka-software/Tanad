export async function bulkDeleteResource(endpoint: string, ids: string[]): Promise<void> {
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete resources at ${endpoint}`);
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
