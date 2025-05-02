import { createClient } from "@/utils/supabase/component";

import type { EnterpriseCreateData, Enterprise } from "./onboarding.type";

export class OnboardingService {
  // Remove TABLE_NAME, not needed for RPC
  // private static readonly TABLE_NAME = "user_enterprises";

  static async createEnterprise(data: EnterpriseCreateData) {
    const supabase = createClient();

    try {
      // Call the RPC function instead of direct insert
      const { data: enterpriseData, error } = await supabase
        .rpc("create_enterprise", {
          enterprise_name: data.name,
          // Pass other data if the RPC function expects it
          enterprise_email: data.email,
          enterprise_industry: data.industry,
          enterprise_size: data.size,
        })
        // Assume RPC returns the necessary data matching the Enterprise type
        // If it returns only an ID, we might need another fetch here.
        .select()
        .single();

      if (error) throw error;
      if (!enterpriseData) throw new Error("RPC did not return enterprise data");

      // No need to update profile here if the RPC handles it.
      // If RPC *doesn't* handle profile update (e.g., needs_onboarding flag),
      // we might need to add that back.

      // Assuming enterpriseData matches the required Enterprise type
      return enterpriseData as Enterprise;
    } catch (error) {
      console.error("Error in createEnterprise RPC call:", error);
      throw error;
    }
  }
}
