import { createClient } from "@/utils/supabase/component";

import type { EnterpriseCreateData } from "./onboarding.type";

export class OnboardingService {
  private static readonly TABLE_NAME = "enterprises";

  static async createEnterprise(data: EnterpriseCreateData) {
    const supabase = createClient();

    // Create the enterprise
    const { data: enterprise, error: enterpriseError } = await supabase
      .from(this.TABLE_NAME)
      .insert(data)
      .select()
      .single();

    if (enterpriseError) throw enterpriseError;

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No authenticated user found");

    // Update user metadata with enterprise_id
    const { error: updateError } = await supabase.auth.updateUser({
      data: { enterprise_id: enterprise.id },
    });

    if (updateError) throw updateError;

    // Create user_enterprises entry with superadmin role
    const { error: userEnterpriseError } = await supabase
      .from("user_enterprises")
      .insert({
        user_id: user.id,
        enterprise_id: enterprise.id,
        role: "superadmin"
      });

    if (userEnterpriseError) throw userEnterpriseError;

    // Update user profile with enterprise_id
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ enterprise_id: enterprise.id })
      .eq("user_id", user.id);

    if (profileError) throw profileError;

    return enterprise;
  }
}
