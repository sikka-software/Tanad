import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { OnboardingService } from "./onboarding.service";
import type { EnterpriseCreateData } from "./onboarding.type";

export function useCreateEnterprise() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: EnterpriseCreateData) => OnboardingService.createEnterprise(data),
    onSuccess: () => {
      toast.success("Enterprise created successfully");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
} 