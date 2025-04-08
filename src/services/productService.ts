import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product.type";

export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error(userError.message);
    }
    
    const userId = userData.user.id;
    
    // First try with user_id filtering
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      // If error is about the column not existing, fetch all products
      if (error.code === "42703") { // PostgreSQL code for undefined_column
        console.warn("user_id column not found, fetching all products");
        const { data: allData, error: allError } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (allError) {
          console.error("Error fetching all products:", allError);
          throw new Error(allError.message);
        }
        
        return allData || [];
      } else {
        console.error("Error fetching products:", error);
        throw new Error(error.message);
      }
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchProducts:", error);
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();

  if (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw new Error(error.message);
  }

  return data;
}

export async function createProduct(product: Omit<Product, "id" | "created_at">): Promise<Product> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error(userError.message);
    }
    
    const userId = userData.user.id;
    
    // Try to insert with user_id
    const productToInsert = {
      ...product,
      user_id: userId, // Use snake_case for database column name
    };
    
    const { data, error } = await supabase
      .from("products")
      .insert([productToInsert])
      .select()
      .single();

    if (error) {
      // If error is about the column not existing, insert without user_id
      if (error.code === "42703") { // PostgreSQL code for undefined_column
        console.warn("user_id column not found, inserting without user_id");
        
        // Remove the user_id from the product object
        const { user_id, ...productWithoutUserId } = productToInsert;
        
        const { data: insertData, error: insertError } = await supabase
          .from("products")
          .insert([productWithoutUserId])
          .select()
          .single();
          
        if (insertError) {
          console.error("Error creating product without user_id:", insertError);
          throw new Error(insertError.message);
        }
        
        return insertData;
      } else {
        console.error("Error creating product:", error);
        throw new Error(error.message);
      }
    }

    return data;
  } catch (error) {
    console.error("Error in createProduct:", error);
    throw error;
  }
}

export async function updateProduct(
  id: string,
  product: Partial<Omit<Product, "id" | "created_at">>,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating product with id ${id}:`, error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    throw new Error(error.message);
  }
}
