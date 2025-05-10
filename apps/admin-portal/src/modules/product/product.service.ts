import { Product, ProductCreateData, ProductUpdateData } from "@/product/product.type";

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("/api/resource/products");
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
}

export async function fetchProductById(id: string): Promise<Product> {
  const response = await fetch(`/api/resource/products/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }
  return response.json();
}

export async function createProduct(product: ProductCreateData): Promise<Product> {
  try {
    const response = await fetch("/api/resource/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    // console.log("Response:", response);
    if (!response.ok) {
      // console.log("Response not ok:", response);
      throw new Error("Failed to create product", { cause: response.statusText });
    }
    return response.json();
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function duplicateProduct(id: string): Promise<Product> {
  const response = await fetch(`/api/resource/products/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to duplicate product");
  }
  return response.json();
}

export async function updateProduct(id: string, product: ProductUpdateData): Promise<Product> {
  const response = await fetch(`/api/resource/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    throw new Error("Failed to update product");
  }
  return response.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`/api/resource/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null); // Try to parse JSON, fallback to null
    // Throw an error object that useDeleteHandler can inspect
    throw {
      message: errorData?.message || response.statusText || "Failed to delete product",
      details: errorData?.details,
      status: response.status,
      errorData: errorData, // include the full error data if needed
    };
  }
  // No return needed for a successful delete if the API returns 204 No Content or similar
}

export async function bulkDeleteProducts(ids: string[]): Promise<void> {
  const response = await fetch("/api/resource/products", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });

  // Read the body once
  // Check if response has content before trying to parse JSON
  const responseBody =
    response.headers.get("content-length") !== "0" && response.body
      ? await response.json().catch(() => null)
      : null;

  if (!response.ok) {
    // Throw an error object that useDeleteHandler can inspect
    throw {
      message: responseBody?.message || response.statusText || "Failed to bulk delete products",
      details: responseBody?.details,
      status: response.status,
      errorData: responseBody, // include the full error data if needed
    };
  }
  // No return needed for a successful delete if the API returns 204 No Content or similar
}
