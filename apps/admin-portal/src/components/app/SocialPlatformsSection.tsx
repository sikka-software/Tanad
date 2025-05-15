import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/ui/button";
// UI
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/form";
import { Input } from "@/components/ui/inputs/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { socialLinkOptions } from "@/ui/social-platforms";

// Define the form schema
const socialLinkSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().url("Please enter a valid URL"),
});

const formSchema = z.object({
  socials_position: z.enum(["top", "bottom"]),
  socialLinks: z.array(socialLinkSchema).max(6),
});

type FormValues = z.infer<typeof formSchema>;

interface SocialPlatformsSectionProps {
  initialLinks?: { platform: string; url: string }[];
  initialPosition?: "top" | "bottom";
  onUpdate: (data: {
    socialLinks: { platform: string; url: string }[];
    socials_position: "top" | "bottom";
  }) => void;
  isPending?: boolean;
}

export interface SocialPlatformsSectionRef {
  submit: () => Promise<void>;
}

const SocialPlatformsSection = React.forwardRef<
  SocialPlatformsSectionRef,
  SocialPlatformsSectionProps
>(({ initialLinks = [], initialPosition = "top", onUpdate, isPending = false }, ref) => {
  const t = useTranslations();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      socials_position: initialPosition,
      socialLinks: initialLinks.length > 0 ? initialLinks : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  // Update parent component when initialLinks or initialPosition change
  React.useEffect(() => {
    form.reset({
      socials_position: initialPosition,
      socialLinks: initialLinks,
    });
  }, [initialLinks, initialPosition, form]);

  // Expose the submit handler to parent through ref
  React.useImperativeHandle(
    ref,
    () => ({
      submit: () => {
        return form.handleSubmit((data) => {
          onUpdate({
            socialLinks: data.socialLinks,
            socials_position: data.socials_position,
          });
        })();
      },
    }),
    [form, onUpdate],
  );

  return (
    <Form {...form}>
      <form className="space-y-4 p-2">
        <div className="space-y-4">
          {/* Socials Position */}
          <FormField
            control={form.control}
            name="socials_position"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-primary text-base">
                    {t("Settings.socials_position_title")}
                  </FormLabel>
                  <FormDescription>{t("Settings.socials_position_description")}</FormDescription>
                </div>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <SelectTrigger className="w-[180px] select-none">
                      <SelectValue placeholder={t("Settings.socials_position_title")} />
                    </SelectTrigger>
                    <SelectContent className="select-none">
                      <SelectItem value="top">{t("Settings.socials_position.top")}</SelectItem>
                      <SelectItem value="bottom">
                        {t("Settings.socials_position.bottom")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col items-start gap-2 sm:flex-row sm:items-end"
            >
              <FormField
                control={form.control}
                name={`socialLinks.${index}.platform`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t("Theme.platform")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Theme.select_platform")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {socialLinkOptions.map((option) => (
                          <SelectItem key={option.platform} value={option.platform}>
                            <div className="flex items-center gap-2 py-2">
                              {option.icon}
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`socialLinks.${index}.url`}
                render={({ field }) => (
                  <FormItem className="flex-[2]">
                    <FormLabel>{t("Theme.url")}</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        placeholder={
                          socialLinkOptions.find(
                            (opt) => opt.platform === form.watch(`socialLinks.${index}.platform`),
                          )?.placeholder || "https://"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {fields.length < 6 && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => append({ platform: "", url: "" })}
          >
            <Plus className="me-2 h-4 w-4" />
            {t("Theme.add_social_link")}
          </Button>
        )}
      </form>
    </Form>
  );
});

SocialPlatformsSection.displayName = "SocialPlatformsSection";

export default SocialPlatformsSection;
