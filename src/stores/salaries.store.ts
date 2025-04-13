import { create } from "zustand";

import { Salary } from "@/types/salary.type";

interface SalariesStore {
  updateSalary: (id: string, data: Partial<Salary>) => Promise<void>;
}

export const useSalariesStore = create<SalariesStore>((set) => ({
  updateSalary: async (id: string, data: Partial<Salary>) => {
    // TODO: Implement actual API call to update salary
    console.log("Updating salary:", id, data);
  },
})); 