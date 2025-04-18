import { useState, useRef } from "react";
import { useForm, UseFormReturn } from "react-hook-form";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import useUserStore from "@/stores/use-user-store";

const formSchema = z.object({
  hideAvatar: z.boolean(),
  hideWatermark: z.boolean(),
  hideTitle: z.boolean(),
  hideBio: z.boolean(),
  avatarShape: z
    .enum(["circle", "square", "horizontal_rectangle", "vertical_rectangle"])
    .default("circle"),
});

type AppearanceFormValues = z.input<typeof formSchema>;

const AppearanceSettings = ({
  onUpdate,
  initialValues,
  isPending: externalIsPending,
  form: externalForm,
}: {
  onUpdate: (values: {
    hideAvatar: boolean;
    hideWatermark: boolean;
    hideTitle: boolean;
    hideBio: boolean;
    avatarShape: "circle" | "square" | "horizontal_rectangle" | "vertical_rectangle";
  }) => Promise<void>;
  initialValues?: {
    hideAvatar: boolean;
    hideWatermark: boolean;
    hideTitle: boolean;
    hideBio: boolean;
    avatarShape: "circle" | "square" | "horizontal_rectangle" | "vertical_rectangle";
  };
  isPending?: boolean;
  form?: UseFormReturn<AppearanceFormValues>;
}) => {
  const t = useTranslations();
  const [isPending, setIsPending] = useState(false);
  const { profile } = useUserStore();

  // TODO: Replace with actual user subscription check
  const isFreePlan = profile?.subscribed_to === "pukla_free";

  // Use external form if provided, otherwise create a new one
  const form =
    externalForm ||
    useForm<AppearanceFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        hideAvatar: initialValues?.hideAvatar ?? false,
        hideWatermark: initialValues?.hideWatermark ?? false,
        hideTitle: initialValues?.hideTitle ?? false,
        hideBio: initialValues?.hideBio ?? false,
        avatarShape: initialValues?.avatarShape ?? "circle",
      },
    });

  // Add a form ref to trigger submit programmatically
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (data: AppearanceFormValues) => {
    try {
      setIsPending(true);
      await onUpdate({
        hideAvatar: data.hideAvatar,
        hideWatermark: data.hideWatermark,
        hideTitle: data.hideTitle,
        hideBio: data.hideBio,
        avatarShape: data.avatarShape || "circle",
      });
      toast.success(t("Settings.appearanceUpdated"));
    } catch (error) {
      toast.error(t("Settings.errorSavingSettings"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Avatar Shape */}
          <FormField
            control={form.control}
            name="avatarShape"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-primary text-base">
                    {t("Settings.avatarShape")}
                  </FormLabel>
                  <FormDescription>{t("Settings.avatarShapeDescription")}</FormDescription>
                </div>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("Settings.selectAvatarShape")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">{t("Settings.avatarShapes.circle")}</SelectItem>
                      <SelectItem value="square">{t("Settings.avatarShapes.square")}</SelectItem>
                      <SelectItem value="horizontal_rectangle">
                        {t("Settings.avatarShapes.horizontal_rectangle")}
                      </SelectItem>
                      <SelectItem value="vertical_rectangle">
                        {t("Settings.avatarShapes.vertical_rectangle")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hideAvatar"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-primary text-base">
                    {t("Settings.hideAvatar")}
                  </FormLabel>
                  <FormDescription>{t("Settings.hideAvatarDescription")}</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                    aria-label={t("Settings.hideAvatar")}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hideTitle"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-primary text-base">
                    {t("Settings.hideTitle")}
                  </FormLabel>
                  <FormDescription>{t("Settings.hideTitleDescription")}</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                    aria-label={t("Settings.hideTitle")}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hideBio"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-primary text-base">{t("Settings.hideBio")}</FormLabel>
                  <FormDescription>{t("Settings.hideBioDescription")}</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                    aria-label={t("Settings.hideBio")}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hideWatermark"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-primary flex flex-row items-center text-base">
                    <span>{t("Settings.hideWatermark")}</span>
                    {profile?.subscribed_to === "pukla_free" && (
                      <Badge variant="outline" className="ms-2">
                        {t("Billing.pro_plan")}
                      </Badge>
                    )}
                  </FormLabel>
                  <FormDescription>{t("Settings.hideWatermarkDescription")}</FormDescription>
                </div>
                <div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending || isFreePlan}
                      aria-label={t("Settings.hideWatermark")}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default AppearanceSettings;
