import { toast } from "sonner";
import { supabase } from "./supabase";
import { LinkItemProps, Pukla } from "./types";

type OperationOptions = {
  toasts: {
    error?: string;
    success?: string;
  };
};

export const checkExistingSlug = async (slug: string) => {
  const { data, error } = await supabase
    .from("puklas")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
};

export const fetchPuklasWithLinkCount = async (
  userId: string,
  options?: OperationOptions
) => {
  const { data, error } = await supabase
    .from("puklas")
    .select(
      `
      *,
      pukla_links (id, item_type)
      `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching puklas with link count:", error);
    toast.error(options?.toasts?.error || "An error occurred");
    return [];
  }

  // Map the data to include the link count
  const puklasWithLinkCount = data.map((pukla) => ({
    ...pukla,
    link_count:
      pukla.pukla_links?.filter((item: any) => item.item_type === "link")
        .length || 0,
  }));

  return puklasWithLinkCount;
};

export const fetchPuklas = async (
  userId: string,
  options: OperationOptions
) => {
  const { data, error } = await supabase
    .from("puklas")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching pukla links:", error);
    toast.error(options.toasts.error);
    return [];
  }
  return data || []; // Return an empty array if no links exist
};
export const fetchPukla = async (
  puklaId: string,
  options: OperationOptions
) => {
  const { data, error } = await supabase
    .from("puklas")
    .select("*")
    .eq("id", puklaId)
    .single();

  if (error) {
    console.error("Error fetching pukla:", error);
    toast.error(options.toasts.error);
    return null;
  }
  return data;
};

export const deletePukla = async (id: string, options: OperationOptions) => {
  const { data, error } = await supabase.from("puklas").delete().eq("id", id);
  if (error) {
    console.error("Error deleting pukla:", error);
    toast.error(options.toasts.error);
    return [];
  } else {
    toast.success(options.toasts.success);
  }
  return data;
};

export const fetchPuklaItems = async (
  puklaId: string | undefined,
  options: OperationOptions
) => {
  if (!puklaId) {
    console.error("No puklaId provided to fetchPuklaItems");
    return [];
  }

  const { data, error } = await supabase
    .from("pukla_links")
    .select("*")
    .eq("pukla_id", puklaId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching pukla links:", error);
    toast.error(options.toasts.error);
    return [];
  }
  return data || [];
};

export const deletePuklaItem = async (
  id: string,
  puklaId: string,
  options: OperationOptions
) => {
  try {
    // Get the position of the item being deleted
    const { data: itemData } = await supabase
      .from("pukla_links")
      .select("position")
      .eq("id", id)
      .single();

    if (!itemData) throw new Error("Item not found");

    // Delete the item
    const { error: deleteError } = await supabase
      .from("pukla_links")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // Update positions of remaining items
    const { error: updateError } = await supabase.rpc(
      "update_positions_after_delete",
      {
        p_pukla_id: puklaId,
        p_deleted_position: itemData.position,
      }
    );

    if (updateError) throw updateError;

    toast.success(options.toasts.success);
  } catch (error) {
    console.error("Error deleting pukla link:", error);
    toast.error(options.toasts.error);
    throw error;
  }
};

export const updateItemPositions = async (
  puklaId: string,
  updates: { id: string; position: number }[],
  options: OperationOptions
) => {
  try {
    const promises = updates.map(({ id, position }) =>
      supabase.from("pukla_links").update({ position }).eq("id", id)
    );

    await Promise.all(promises);
    toast.success(options.toasts.success);
  } catch (error) {
    console.error("Error updating positions:", error);
    toast.error(options.toasts.error);
    throw error;
  }
};

export const updateItemStatus = async (
  id: string,
  is_enabled: boolean,
  options: OperationOptions
) => {
  try {
    const { error } = await supabase
      .from("pukla_links")
      .update({ is_enabled })
      .eq("id", id);

    if (error) throw error;
    toast.success(options.toasts.success);
  } catch (error) {
    console.error("Error updating item status:", error);
    toast.error(options.toasts.error);
    throw error;
  }
};

export const updateLink = async (
  id: string,
  data: Partial<LinkItemProps>,
  options: OperationOptions
) => {
  try {
    const { error } = await supabase
      .from("pukla_links")
      .update(data)
      .eq("id", id);

    if (error) throw error;
    toast.success(options.toasts.success);
  } catch (error) {
    console.error("Error updating link:", error);
    toast.error(options.toasts.error);
    throw error;
  }
};

export const fetchAllPuklas = async (options: OperationOptions) => {
  const { data, error } = await supabase
    .from("puklas")
    .select("slug, updated_at");
  if (error) throw error;
  return data;
};

export const createPukla = async (data: Partial<Pukla>, userId: string) => {
  const { data: pukla, error } = await supabase
    .from("puklas")
    .insert([{ ...data, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return pukla;
};

export const addLinkToPukla = async (
  puklaId: string,
  data: Partial<LinkItemProps>
) => {
  const { data: link, error } = await supabase
    .from("pukla_links")
    .insert([{ ...data, pukla_id: puklaId }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return link;
};
