import { useQuery } from "@tanstack/react-query";

import { useUser } from "@/providers/UserProvider";
import { Company } from "@/types/company.type";

async function getCompanies(userId: string): Promise<Company[]> {
  const response = await fetch(`/api/companies?userId=${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch companies");
  }
  return response.json();
}

export function useCompanies() {
  const { userId } = useUser();

  return useQuery<Company[], Error>({
    queryKey: ["companies", userId],
    queryFn: () => getCompanies(userId!),
    enabled: !!userId,
  });
} 