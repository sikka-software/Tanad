import { create } from "zustand";

import { Branch } from "@/types/branch.type";
import { updateBranch as updateBranchService } from "@/services/branchService";

interface BranchesStore {
  updateBranch: (id: string, data: Partial<Branch>) => Promise<void>;
}

export const useBranchesStore = create<BranchesStore>((set) => ({
  updateBranch: async (id: string, data: Partial<Branch>) => {
    try {
      await updateBranchService(id, data);
    } catch (error) {
      console.error("Error updating branch:", error);
      throw error;
    }
  },
})); 