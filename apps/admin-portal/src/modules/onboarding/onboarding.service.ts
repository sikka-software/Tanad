import { createClient } from "@/utils/supabase/component";

import type { EnterpriseCreateData } from "./onboarding.type";

export class OnboardingService {
  private static readonly TABLE_NAME = "user_enterprises";

  static async createEnterprise(data: EnterpriseCreateData) {
    const supabase = createClient();

    try {
      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user found");

      // Create the enterprise through the user_enterprises view
      const { data: enterprise, error: enterpriseError } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          user_id: user.id,
          enterprise_name: data.name,
          description: data.description,
          logo: data.logo,
          email: data.email,
          industry: data.industry,
          size: data.size,
        })
        .select()
        .single();

      if (enterpriseError) throw enterpriseError;

      // Update the user's profile to mark onboarding as complete
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          needs_onboarding: false,
          enterprise_id: enterprise.enterprise_id,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      return enterprise;
    } catch (error) {
      console.error("Error in createEnterprise:", error);
      throw error;
    }
  }
}
