import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Office } from "@/types/office.type";
import { supabase } from "@/lib/supabase";

// Service functions
const fetchOffices = async () => {
  const { data, error } = await supabase
    .from("offices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

const fetchOfficeById = async (id: string) => {
  const { data, error } = await supabase
    .from("offices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

const createOffice = async (office: Omit<Office, "id" | "created_at">) => {
  const { data, error } = await supabase
    .from("offices")
    .insert([office])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateOffice = async (id: string, office: Partial<Omit<Office, "id" | "created_at">>) => {
  const { data, error } = await supabase
    .from("offices")
    .update(office)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteOffice = async (id: string) => {
  const { error } = await supabase
    .from("offices")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return id;
};

// Hooks
export function useOffices() {
  return useQuery({
    queryKey: ["offices"],
    queryFn: fetchOffices,
  });
}

export function useOffice(id: string) {
  return useQuery({
    queryKey: ["offices", id],
    queryFn: () => fetchOfficeById(id),
    enabled: !!id,
  });
}

export function useCreateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newOffice: Omit<Office, "id" | "created_at">) => createOffice(newOffice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
    },
  });
}

export function useUpdateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      office,
    }: {
      id: string;
      office: Partial<Omit<Office, "id" | "created_at">>;
    }) => updateOffice(id, office),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["offices", data.id] });
      queryClient.invalidateQueries({ queryKey: ["offices"] });
    },
  });
}

export function useDeleteOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOffice(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      queryClient.removeQueries({ queryKey: ["offices", variables] });
    },
  });
} 