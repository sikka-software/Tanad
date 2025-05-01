import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Loader2, Trash, ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import AdjustableDialog from "@/ui/adjustable-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
// UI
import { Button } from "@/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import { Pukla } from "@/lib/types";

import { useMainStore } from "@/hooks/main.store";
import useUserStore from "@/stores/use-user-store";
// import { checkExistingSlug } from "@/lib/operations";
import { createClient } from "@/utils/supabase/component";

interface OnboardingDialogProps {
  onClose?: () => void;
}

export function OnboardingDialog({ onClose }: OnboardingDialogProps) {
  const supabase = createClient();
  const t = useTranslations();
  const router = useRouter();
  const { user } = useUserStore();
  const { setPuklas, setSelectedPukla } = useMainStore();
  const [isOpen, setIsOpen] = useState(true);
  const [createdPukla, setCreatedPukla] = useState<Pukla | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const formSchema = z.object({
    slug: z
      .string()
      .min(1, t("MyPuklas.pukla_slug_required"))
      .regex(
        /^[a-zA-Z0-9-]+$/,
        t("MyPuklas.custom_slug_can_only_contain_letters_numbers_and_hyphens"),
      ),
    title: z
      .string()
      .min(1, t("MyPuklas.pukla_title_required"))
      .min(3, t("MyPuklas.pukla_title_too_short"))
      .max(50, t("MyPuklas.pukla_title_too_long")),
    bio: z
      .string()
      .optional()
      .transform((val) => val || ""),
    avatar_url: z
      .string()
      .optional()
      .transform((val) => val || ""),
  });

  const linksSchema = z.object({
    links: z.array(
      z.object({
        title: z.string().min(1, t("Editor.link_title_required")),
        url: z
          .string()
          .min(1, t("Editor.link_url_required"))
          .refine((val) => {
            try {
              new URL(`https://${val}`);
              return true;
            } catch {
              return false;
            }
          }, t("Editor.link_url_invalid")),
      }),
    ),
  });

  type FormValues = z.input<typeof formSchema>;
  type LinksFormValues = z.input<typeof linksSchema>;

  const form = useForm<FormValues>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
      title: "",
      bio: "",
      avatar_url: "",
    },
  });

  const linksForm = useForm<LinksFormValues>({
    mode: "onChange",
    resolver: zodResolver(linksSchema),
    defaultValues: {
      links: [{ title: "", url: "" }],
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const generateSlug = async () => {
    setIsGeneratingSlug(true);
    try {
      let isUnique = false;
      let slug = "";

      while (!isUnique) {
        // Generate a random slug
        slug = Math.random().toString(36).substring(2, 8);

        // Check if the slug exists in the database
        // const existingSlug = await checkExistingSlug(slug);

        // if (!existingSlug) {
        //   isUnique = true;
        // }
      }
      form.setValue("slug", slug);
    } catch (error) {
      console.error(error);
      toast.error(t("MyPuklas.error_generating_slug"));
    } finally {
      setIsGeneratingSlug(false);
    }
  };

  const handleNext = async (step: number) => {
    if (step === 0) {
      const isValid = await form.trigger();
      if (!isValid) return false;

      // Check if slug exists
      const values = form.getValues();
      if (values.slug) {
        // const existingSlug = await checkExistingSlug(values.slug);
        // if (existingSlug) {
        //   form.setError("slug", {
        //     type: "manual",
        //     message: t("MyPuklas.this_custom_slug_is_already_taken"),
        //   });
        //   return false;
        // }
      }

      return true;
    }

    if (step === 1) {
      const isValid = await linksForm.trigger();
      if (!isValid) return false;

      // Create pukla and links before moving to step 3
      setIsSubmitting(true);
      try {
        // First upload avatar if exists
        let avatarPath = "";
        if (avatarFile) {
          let fileName = `${user?.id}-${Date.now()}.${avatarFile.name.split(".").pop()}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("pukla_avatars")
            .upload(fileName, avatarFile);

          if (uploadError) throw uploadError;
          const {
            data: { publicUrl },
          } = await supabase.storage.from("pukla_avatars").getPublicUrl(fileName);
          avatarPath = publicUrl;
        }

        // Then create the pukla
        const values = form.getValues();
        const { data: newPukla, error: puklaError } = await supabase
          .from("puklas")
          .insert({
            user_id: user?.id,
            slug: values.slug.toLowerCase() || (await generateSlug()),
            title: values.title,
            bio: values.bio,
            avatar_url: avatarPath,
            theme: {
              primary_color: "#000000",
              background_color: "#ffffff",
              text_color: "#000000",
              link_color: "#000000",
              button_color: "#000000",
              button_text_color: "#ffffff",
              button_hover_color: "#000000",
              button_border_color: "#000000",
              theme_name: "default",
              border_color: "#000000",
              border_radius: "5px",
            },
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
          })
          .select()
          .single();

        if (puklaError) throw puklaError;

        // Then create the links
        const linkValues = linksForm.getValues();
        const { error: linksError } = await supabase.from("pukla_links").insert(
          linkValues.links.map((link, index) => ({
            pukla_id: newPukla.id,
            title: link.title,
            url: "https://" + link.url,
            position: index,
            is_draft: false,
            is_enabled: true,
            is_favorite: false,
            is_expanded: false,
            item_type: "link",
          })),
        );

        if (linksError) throw linksError;

        const puklaWithType = newPukla as Pukla;
        const updatedPuklas = [...useMainStore.getState().puklas, puklaWithType];
        setPuklas(updatedPuklas);
        setSelectedPukla(puklaWithType);
        setCreatedPukla(puklaWithType);
        setCurrentStep(step + 1);

        return true;
      } catch (error) {
        console.error(error);
        toast.error(t("MyPuklas.error_creating_pukla"));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }

    if (step === 2) {
      setCurrentStep(step + 1);
      return true;
    }

    if (step === 3) {
      handleClose();
      return true;
    }

    return true;
  };

  // Function to check if content is scrollable
  const checkScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isScrollable = target.scrollHeight > target.clientHeight;
    const isScrolledToBottom =
      Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) < 1;
    setShowScrollIndicator(isScrollable && !isScrolledToBottom);
  };

  const onboardingItems = [
    {
      id: "step1",
      content: (
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("MyPuklas.custom_slug_optional")}</FormLabel>
                  <div className="relative" dir="ltr">
                    <span className="border-input bg-background text-muted-foreground absolute inline-flex h-full items-center rounded-s-lg border px-3 text-sm">
                      https://puk.la/
                    </span>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-full ps-32"
                        placeholder={t("MyPuklas.custom_slug_placeholder")}
                        onChange={(e) => {
                          field.onChange(e);
                          form.trigger("slug");
                        }}
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute end-2 top-1/2 -translate-y-1/2"
                      onClick={async () => {
                        await generateSlug();
                        form.trigger("slug");
                      }}
                    >
                      {isGeneratingSlug ? (
                        <Loader2 className="text-muted-foreground size-4 animate-spin" />
                      ) : (
                        <Sparkles className="text-muted-foreground size-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("MyPuklas.pukla_title")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("MyPuklas.pukla_title_placeholder")}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.trigger("title");
                      }}
                    />
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
                    <Textarea
                      placeholder={t("MyPuklas.pukla_bio_placeholder")}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.trigger("bio");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("OnBoardingForm.avatar")}</FormLabel>
                  <FormControl>
                    <>
                      <Input
                        id="avatar-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAvatarFile(file);
                            field.onChange(file.name); // Just store the filename temporarily
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById("avatar-image-upload")?.click()}
                      >
                        {t("OnBoardingForm.upload_image")}
                      </Button>
                    </>
                  </FormControl>
                  {avatarFile && (
                    <Avatar>
                      <AvatarImage src={URL.createObjectURL(avatarFile)} />
                      <AvatarFallback>Avatar</AvatarFallback>
                    </Avatar>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      ),
    },
    {
      id: "step2",
      content: (
        <Form {...linksForm}>
          <div className="relative">
            <div
              className="mb-2 max-h-[60vh] space-y-4 overflow-y-auto scroll-smooth rounded-lg border p-2"
              onScroll={checkScroll}
              ref={(el) => {
                // Check initial scroll state
                if (el) {
                  const isScrollable = el.scrollHeight > el.clientHeight;
                  const isScrolledToBottom =
                    Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 1;
                  setShowScrollIndicator(isScrollable && !isScrolledToBottom);
                }
              }}
            >
              {linksForm.watch("links").map((_, index) => (
                <div key={index} className="relative space-y-2 rounded-lg border p-4">
                  <FormField
                    control={linksForm.control}
                    name={`links.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("OnBoardingForm.link_title")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={linksForm.control}
                    name={`links.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("OnBoardingForm.link_url")}</FormLabel>
                        <FormControl dir="ltr">
                          <div className="flex rounded-md shadow-xs">
                            <span className="border-input bg-background text-muted-foreground -z-10 inline-flex items-center rounded-s-md border px-3 pe-1 text-sm">
                              https://
                            </span>
                            <Input
                              className="rounded-s-none ps-1 shadow-none"
                              type="text"
                              {...field}
                              onChange={(e) => {
                                // Remove https:// if user pastes full URL
                                const value = e.target.value.replace(/^https?:\/\//, "");
                                field.onChange(value);
                                linksForm.trigger(`links.${index}.url`);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {linksForm.watch("links").length > 1 && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon_sm"
                        className="end-0"
                        onClick={() => {
                          const currentLinks = linksForm.watch("links");
                          linksForm.setValue(
                            "links",
                            currentLinks.filter((_, i) => i !== index),
                          );
                        }}
                      >
                        <Trash className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon_sm"
                        className="end-0"
                        disabled={index === linksForm.watch("links").length - 1}
                        onClick={() => {
                          const currentLinks = linksForm.watch("links");
                          const newLinks = [...currentLinks];
                          [newLinks[index], newLinks[index + 1]] = [
                            newLinks[index + 1],
                            newLinks[index],
                          ];
                          linksForm.setValue("links", newLinks);
                        }}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon_sm"
                        className="end-0"
                        disabled={index === 0}
                        onClick={() => {
                          const currentLinks = linksForm.watch("links");
                          const newLinks = [...currentLinks];
                          [newLinks[index], newLinks[index - 1]] = [
                            newLinks[index - 1],
                            newLinks[index],
                          ];
                          linksForm.setValue("links", newLinks);
                        }}
                      >
                        <ArrowDown className="size-4 rotate-180" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {showScrollIndicator && (
              <div className="from-background pointer-events-none absolute right-0 bottom-0 left-0 h-8 rounded-b-lg bg-gradient-to-t to-transparent" />
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              linksForm.setValue("links", [...linksForm.watch("links"), { title: "", url: "" }])
            }
          >
            {t("OnBoardingForm.add_more_links")}
          </Button>
        </Form>
      ),
    },
    {
      id: "step3",
      content: (
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">{t("OnBoarding.congratulations")}</h2>
          <p>{t("OnBoarding.pukla_created")}</p>
          <div className="flex justify-center">
            {createdPukla && (
              <QRCodeSVG
                value={`${process.env.NEXT_PUBLIC_APP_URL}/${createdPukla.slug}`}
                size={200}
                level="L"
                className="rounded-lg p-2 dark:bg-white"
              />
            )}
          </div>
        </div>
      ),
    },
    {
      id: "step4",
      content: (
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-semibold">{t("OnBoarding.next_steps")}</h2>
          <p>{t("OnBoarding.editor_info")}</p>
          <p>{t("OnBoarding.theme_info")}</p>
          <div className="flex justify-center gap-2">
            <Button onClick={() => router.push("/editor")}>{t("OnBoarding.go_to_editor")}</Button>
            <Button variant="outline" onClick={() => router.push("/theme")}>
              {t("OnBoarding.go_to_theme")}
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AdjustableDialog
      items={onboardingItems}
      isOpen={isOpen}
      onOpenChange={handleClose}
      title={t("OnBoarding.title")}
      onNext={handleNext}
      hidePreviousButton={currentStep > 1}
    />
  );
}
