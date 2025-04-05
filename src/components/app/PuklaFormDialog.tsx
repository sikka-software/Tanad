import React from "react";
import { useForm } from "react-hook-form";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
// UI
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useUserStore from "@/hooks/use-user-store";
import { blacklist } from "@/lib/constants";
import { checkExistingSlug } from "@/lib/operations";
import { supabase } from "@/lib/supabase";

type PuklaFormDialogProps = {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  mode: "create" | "edit";
  pukla?: any;
  onSuccess?: () => void;
};

export const PuklaFormDialog: React.FC<PuklaFormDialogProps> = ({
  openDialog,
  setOpenDialog,
  mode,
  pukla,
  onSuccess,
}) => {
  const t = useTranslations();
  const lang = useLocale();
  const { user } = useUserStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGeneratingSlug, setIsGeneratingSlug] = React.useState(false);

  const formSchema = z.object({
    title: z
      .string({
        required_error: t("MyPuklas.pukla_title_required"),
      })
      .min(3, { message: t("MyPuklas.pukla_title_too_short") })
      .max(50, { message: t("MyPuklas.pukla_title_too_long") }),
    bio: z.string().optional(),
    slug: z
      .string({
        required_error: t("MyPuklas.pukla_slug_required"),
      })
      .min(1, { message: t("MyPuklas.pukla_slug_too_short") })
      .max(50, { message: t("MyPuklas.pukla_slug_too_long") })
      .regex(/^[a-zA-Z0-9-]+$/, {
        message: t("MyPuklas.pukla_slug_invalid"),
      })
      .refine(
        (value) => {
          if (mode === "create" && user?.subscribed_to === "pukla_free") {
            return value.length >= 5;
          }
          return true;
        },
        { message: t("MyPuklas.short_slug_pro_feature") },
      ),
    is_public: z.boolean().default(false),
  });

  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", bio: "", slug: "", is_public: false },
  });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (openDialog) {
      if (mode === "edit" && pukla) {
        form.reset({
          title: pukla.title || "",
          bio: pukla.bio || "",
          slug: pukla.slug || "",
          is_public: pukla.is_public || false,
        });
      } else {
        form.reset({ title: "", bio: "", slug: "", is_public: false });
      }
    }
  }, [openDialog, mode, pukla, form]);

  const generateSlug = async () => {
    setIsGeneratingSlug(true);
    try {
      let isUnique = false;
      let slug = "";

      while (!isUnique) {
        // Generate a random slug
        slug = Math.random().toString(36).substring(2, 8);

        // Check if the slug exists in the database
        const existingSlug = await checkExistingSlug(slug);

        if (!existingSlug) {
          isUnique = true;
        }
      }
      form.setValue("slug", slug);
    } catch (error) {
      console.error(error);
      toast.error(t("MyPuklas.error_generating_slug"));
    } finally {
      setIsGeneratingSlug(false);
    }
  };

  const onSubmit = async (values: z.input<typeof formSchema>) => {
    try {
      setIsLoading(true);

      if (mode === "create" && !user?.id) {
        toast.error(t("General.error"));
        return;
      }

      // If slug is from the blacklist, return
      if (blacklist.includes(values.slug.toLowerCase())) {
        toast.error(t("MyPuklas.this_custom_slug_is_not_allowed"));
        return;
      }

      // Check if slug is already taken
      const { data: existingPukla } = await supabase
        .from("puklas")
        .select("id")
        .eq("slug", values.slug)
        .neq("id", pukla?.id || "")
        .single();

      if (existingPukla) {
        form.setError("slug", {
          message: t("Editor.slug_already_taken"),
        });
        return;
      }

      if (mode === "create") {
        const { error } = await supabase.from("puklas").insert({
          title: values.title,
          bio: values.bio,
          slug: values.slug.toLowerCase(),
          user_id: user?.id,
          is_public: values.is_public,
          settings: {
            icons_position: "top",
            default_lang: "en",
            languages: ["en"],
            langauge_switcher: false,
            hide_avatar: false,
            hide_watermark: false,
            hide_title: false,
            hide_bio: false,
            animation: "none",
          },
          theme: {
            primary_color: "#000000",
            background_color: "#ffffff",
            text_color: "#000000",
            link_color: "#000000",
            button_color: "#000000",
            button_text_color: "#ffffff",
            button_hover_color: "#000000",
          },
        });

        if (error) throw error;

        toast.success(t("MyPuklas.pukla_created_successfully"));
      } else {
        const { error } = await supabase
          .from("puklas")
          .update({
            title: values.title,
            bio: values.bio,
            slug: values.slug.toLowerCase(),
            is_public: values.is_public,
          })
          .eq("id", pukla.id);

        if (error) throw error;

        toast.success(t("Editor.pukla_updated_successfully"));
      }

      setOpenDialog(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error handling pukla:", error);
      toast.error(
        mode === "create" ? t("MyPuklas.error_creating_pukla") : t("General.something_went_wrong"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent dir={lang === "ar" ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? t("MyPuklas.create_pukla") : t("Editor.edit_pukla")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("MyPuklas.pukla_title")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("MyPuklas.pukla_title_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("MyPuklas.pukla_bio")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("MyPuklas.pukla_bio_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("MyPuklas.custom_slug_optional")}</FormLabel>
                  <FormControl>
                    <div className="relative" dir="ltr">
                      <span className="border-input bg-background text-muted-foreground absolute inline-flex h-full items-center rounded-s-lg border px-3 text-sm">
                        https://puk.la/
                      </span>
                      <Input
                        {...field}
                        className="w-full ps-32"
                        placeholder={t("MyPuklas.custom_slug_placeholder")}
                      />
                      <button
                        type="button"
                        className="absolute end-2 top-1/2 -translate-y-1/2"
                        onClick={generateSlug}
                      >
                        {isGeneratingSlug ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Sparkles className="text-muted-foreground size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  {mode === "create" && user?.subscribed_to === "pukla_free" && (
                    <p className="text-muted-foreground text-xs">
                      {t("MyPuklas.short_slug_pro_feature_description")}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("MyPuklas.is_discoverable")}</FormLabel>
                    <FormDescription>
                      {t.rich("MyPuklas.is_discoverable_description", {
                        directoryLink: (chunks) => (
                          <Link
                            target="_blank"
                            className="clickable-link"
                            href={`/${lang}/directory`}
                          >
                            {chunks}
                          </Link>
                        ),
                      })}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : mode === "create" ? (
                t("MyPuklas.create")
              ) : (
                t("General.save")
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
