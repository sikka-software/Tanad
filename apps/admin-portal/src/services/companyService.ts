import { Company } from "@/types/company.type";

export async function fetchCompanies(): Promise<Company[]> {
  const response = await fetch("/api/companies");
  if (!response.ok) {
    throw new Error("Failed to fetch companies");
  }
  return response.json();
}

export async function fetchCompanyById(id: string): Promise<Company> {
  const response = await fetch(`/api/companies/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch company");
  }
  return response.json();
}

export async function createCompany(company: Omit<Company, "id" | "created_at">): Promise<Company> {
  const response = await fetch("/api/companies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(company),
  });
  if (!response.ok) {
    throw new Error("Failed to create company");
  }
  return response.json();
}

export async function updateCompany(
  id: string,
  company: Partial<Omit<Company, "id" | "created_at">>,
): Promise<Company> {
  const response = await fetch(`/api/companies/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(company),
  });
  if (!response.ok) {
    throw new Error("Failed to update company");
  }
  return response.json();
}

export async function deleteCompany(id: string): Promise<void> {
  const response = await fetch(`/api/companies/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete company");
  }
}
