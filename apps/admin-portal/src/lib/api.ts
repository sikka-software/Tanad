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

    // Read the response body if it exists
    const responseBody = response.headers.get("content-length") !== "0" && response.body
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok) {
      throw new Error(responseBody?.message || "Failed to delete resources");
    }

    return responseBody || { success: true };
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
