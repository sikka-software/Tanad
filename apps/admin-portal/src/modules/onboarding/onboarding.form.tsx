import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { createClient } from "@/utils/supabase/component";

const formSchema = z.object({
  name: z.string().min(1, "Enterprise name is required"),
});

type FormData = z.infer<typeof formSchema>;

export function OnboardingForm() {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Call the create_enterprise function
      const { data: enterpriseId, error } = await supabase
        .rpc('create_enterprise', {
          enterprise_name: data.name
        });

      if (error) throw error;

      toast.success(t("OnBoarding.enterprise_created"));
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error creating enterprise:", error);
      toast.error(error.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("OnBoarding.form.enterprise_name")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("OnBoarding.form.enterprise_name_placeholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {t("OnBoarding.form.create_enterprise")}
        </Button>
      </form>
    </Form>
  );
}
