import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import useUserStore from "@/stores/use-user-store";

import { OnboardingService } from "./onboarding.service";
import type { EnterpriseCreateData, Enterprise } from "./onboarding.type";

export function useCreateEnterprise() {
  const router = useRouter();

  return useMutation<Enterprise, Error, EnterpriseCreateData>({
    mutationFn: (data: EnterpriseCreateData) => OnboardingService.createEnterprise(data),
    onSuccess: async (createdEnterprise) => {
      toast.success("Enterprise created successfully");
      await useUserStore.getState().fetchUserAndProfile();
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
