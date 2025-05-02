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

    console.log("Response:", response);
    if (!response.ok) {
      console.log("Response not ok:", response);
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
    throw new Error("Failed to delete product");
  }
}

export async function bulkDeleteProducts(ids: string[]): Promise<void> {
  const response = await fetch("/api/resource/products", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete products");
  }
}
