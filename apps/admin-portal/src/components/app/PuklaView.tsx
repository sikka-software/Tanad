import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { motion } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import AgeVerificationDialog from "@/components/app/AgeVerificationDialog";
import MoreOptions from "@/components/app/MoreOptions";
import PasswordDialog from "@/components/app/PasswordDialog";
import SocialLinks from "@/components/app/PuklaViewSocialLinks";
// Components
import { ShareDialog } from "@/components/app/ShareDialog";
// UI
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { ANIMATIONS } from "@/lib/constants/animations";
// Types
import { LinkItemProps, AnimationType, LinkLayoutType, Pukla } from "@/lib/types";
import { cn, shouldUseLightContent } from "@/lib/utils";

import { createClient } from "@/utils/supabase/component";

export const PuklaView: React.FC<{ pukla?: Pukla }> = ({ pukla }) => {
  const supabase = createClient();
  const t = useTranslations();
  const lang = useLocale();
  const router = useRouter();

  const passwordSchema = z.object({
    password: z
      .string({
        message: t("Editor.lock_link.password_protected.password_required"),
      })
      .min(1, t("Editor.lock_link.password_protected.password_required")),
  });

  const ageSchema = z.object({
    day: z.string().min(1, t("Editor.lock_link.requires_date_of_birth.day_required")),
    month: z.string().min(1, t("Editor.lock_link.requires_date_of_birth.month_required")),
    year: z.string().min(1, t("Editor.lock_link.requires_date_of_birth.year_required")),
  });

  const [filteredLinks, setFilteredLinks] = React.useState<LinkItemProps[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [puklaTheme, setPuklaTheme] = React.useState<any>(null);
  const [puklaSettings, setPuklaSettings] = React.useState<any>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [openShareDialog, setOpenShareDialog] = React.useState(false);
  const [currentLink, setCurrentLink] = useState<LinkItemProps | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAgeDialog, setShowAgeDialog] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState<{
    [key: string]: boolean;
  }>({});
  const [isAgeVerified, setIsAgeVerified] = useState<{
    [key: string]: boolean;
  }>({});
  const [verificationError, setVerificationError] = useState("");

  const selectedAnimation = (puklaSettings?.animation || "fade") as AnimationType;
  const animation = ANIMATIONS[selectedAnimation];

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  const ageForm = useForm<z.infer<typeof ageSchema>>({
    resolver: zodResolver(ageSchema),
  });

  useEffect(() => {
    const fetchPuklaItems = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("pukla_links")
          .select(
            `
            *,
            is_password_protected,
            is_age_restricted,
            min_age
          `,
          )
          .eq("pukla_id", pukla?.id)
          .eq("is_enabled", true)
          .order("position", { ascending: true });

        if (error) {
          console.error("Error fetching links:", error);
          return;
        }

        console.log("Fetched links:", data); // Debug log
        setFilteredLinks(data || []);
      } catch (error) {
        console.error("Error in fetchPuklaItems:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPuklaThemeAndSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("puklas")
          .select("*")
          .eq("id", pukla?.id)
          .single();

        if (error) {
          console.error("Error fetching theme:", error);
          return;
        }

        setPuklaTheme(data.theme);
        // Ensure we have valid settings with a default animation
        const settings = {
          ...data.settings,
          animation: data.settings?.animation || "fade",
        };
        setPuklaSettings(settings);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error fetching theme:", error);
      }
    };

    if (pukla?.id) {
      fetchPuklaItems();
      fetchPuklaThemeAndSettings();
    }
  }, [pukla?.id]);

  const handleLinkClick = async (e: React.MouseEvent, link: LinkItemProps) => {
    e.preventDefault();
    console.log("Link clicked:", link); // Debug log
    setCurrentLink(link);

    // If link is already verified, open it directly
    if (isPasswordVerified[link.id] && isAgeVerified[link.id]) {
      window.open(link.url, "_blank");
      return;
    }

    // Check if link needs verification
    if (link.is_password_protected) {
      setShowPasswordDialog(true);
      return;
    }

    if (link.is_age_restricted) {
      setShowAgeDialog(true);
      return;
    }

    // If no protection, open link directly
    window.open(link.url, "_blank");
  };

  const handlePasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!currentLink) return;

    try {
      const { data, error } = await supabase.rpc("verify_password", {
        link_id: currentLink.id,
        provided_password: values.password,
      });

      if (error) throw error;

      if (data) {
        setIsPasswordVerified((prev) => ({ ...prev, [currentLink.id]: true }));
        setShowPasswordDialog(false);

        // If age verification isn't required or is already verified, open the link
        if (!currentLink.is_age_restricted || isAgeVerified[currentLink.id]) {
          window.open(currentLink.url, "_blank");
        } else {
          setShowAgeDialog(true);
        }
      } else {
        setVerificationError(t("Editor.lock_link.password_protected.invalid_password"));
      }
    } catch (error) {
      console.error("Password verification error:", error);
      setVerificationError(t("General.error_occurred"));
    }
  };

  const handleAgeSubmit = async (values: z.infer<typeof ageSchema>) => {
    if (!currentLink) return;

    const birthDate = new Date(
      parseInt(values.year),
      parseInt(values.month) - 1,
      parseInt(values.day),
    );
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    try {
      if (age >= (currentLink.min_age || 18)) {
        setIsAgeVerified((prev) => ({ ...prev, [currentLink.id]: true }));
        setShowAgeDialog(false);

        // If all verifications are complete, open the link
        if (!currentLink.is_password_protected || isPasswordVerified[currentLink.id]) {
          window.open(currentLink.url, "_blank");
        }
      } else {
        setVerificationError(t("Editor.lock_link.requires_date_of_birth.too_young"));
      }
    } catch (error) {
      console.error("Age verification error:", error);
      setVerificationError(t("General.error_occurred"));
    }
  };

  const getButtonClasses = (layout?: LinkLayoutType) => {
    switch (layout) {
      case "double-height":
        return "w-full min-h-[88px]"; // Double the standard height
      case "half-width":
        return "w-[48%]"; // Half width, standard height
      case "square":
        return "w-[48%] min-h-[100px]"; // Half width and 100px height for square
      default:
        return "w-full"; // Standard height
    }
  };

  const isHalfWidthLayout = (layout?: LinkLayoutType) => {
    return layout === "half-width" || layout === "square";
  };

  const renderLinks = () => {
    // Create a copy of filteredLinks to avoid modifying the original array
    const linksToRender = [...filteredLinks];
    const processedIndices = new Set();

    console.log("links to render", linksToRender);
    if (!animation || selectedAnimation === "none") {
      return (
        <div className="flex w-full flex-1 flex-col items-center gap-4 px-0">
          {linksToRender
            .map((singleLink: LinkItemProps, index: number) => {
              // Skip if this index has already been processed
              if (processedIndices.has(index)) return null;

              if (singleLink.item_type === "header") {
                return (
                  <div key={singleLink.id || index} className="w-full py-4 text-center">
                    <h2 className="text-lg font-bold" style={{ color: puklaTheme?.text_color }}>
                      {singleLink.title}
                    </h2>
                  </div>
                );
              }

              const currentLayout = singleLink.item_layout;
              const nextLink = linksToRender[index + 1];
              const isCurrentHalfWidth = isHalfWidthLayout(currentLayout);
              const isNextHalfWidth = nextLink && isHalfWidthLayout(nextLink.item_layout);

              if (isCurrentHalfWidth && isNextHalfWidth) {
                // Mark the next index as processed
                processedIndices.add(index + 1);
                return (
                  <div key={`row-${singleLink.id}`} className="flex w-full justify-center gap-4">
                    <div className={getButtonClasses(currentLayout)}>
                      <a
                        href={singleLink.url}
                        className="block w-full transition-transform hover:scale-105"
                        onClick={(e) => handleLinkClick(e, singleLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div
                          className={cn(
                            buttonVariants({ size: "lg", variant: "outline" }),
                            "flex w-full items-center justify-center gap-2 border text-center text-wrap shadow-sm hover:opacity-90",
                            singleLink.item_highlight === "outline" && "animate-highlight_outline",
                            singleLink.item_highlight === "border" && "animate-highlight_border",
                            singleLink.item_highlight === "scale" && "animate-highlight_scale",
                            {
                              "flex h-[100px] items-center justify-center":
                                singleLink.item_layout === "square",
                              "flex h-[88px] items-center justify-center":
                                singleLink.item_layout === "double-height",
                              "py-2":
                                singleLink.item_layout !== "double-height" &&
                                singleLink.item_layout !== "square",
                            },
                          )}
                          style={{
                            lineBreak: "anywhere",
                            color: puklaTheme?.button_text_color,
                            borderRadius: puklaTheme?.border_radius,
                            borderColor: puklaTheme?.border_color,
                            backgroundColor: puklaTheme?.button_color,
                          }}
                        >
                          {singleLink.item_thumbnail?.thumbnail_type === "icon" &&
                            singleLink.item_thumbnail?.thumbnail_icon &&
                            singleLink.item_thumbnail?.thumbnail_icon.position === "start" && (
                              <div className="flex items-center justify-center">
                                <DynamicIcon
                                  name={singleLink.item_thumbnail?.thumbnail_icon?.name as any}
                                  className="h-5 w-5"
                                />
                              </div>
                            )}
                          {singleLink.item_thumbnail?.thumbnail_type === "image" &&
                            singleLink.item_thumbnail?.thumbnail_image &&
                            singleLink.item_thumbnail?.position === "start" && (
                              <div className="relative h-5 w-5">
                                <Image
                                  src={singleLink.item_thumbnail?.thumbnail_image}
                                  alt={singleLink.title}
                                  fill
                                  className="rounded-sm object-cover"
                                />
                              </div>
                            )}
                          {singleLink.title}
                          {singleLink.item_thumbnail?.thumbnail_type === "icon" &&
                            singleLink.item_thumbnail?.thumbnail_icon &&
                            singleLink.item_thumbnail?.thumbnail_icon.position === "end" && (
                              <div className="flex items-center justify-center">
                                <DynamicIcon
                                  name={singleLink.item_thumbnail?.thumbnail_icon?.name as any}
                                  className="h-5 w-5"
                                />
                              </div>
                            )}
                          {singleLink.item_thumbnail?.thumbnail_type === "image" &&
                            singleLink.item_thumbnail?.thumbnail_image &&
                            singleLink.item_thumbnail?.position === "end" && (
                              <div className="relative h-5 w-5">
                                <Image
                                  src={singleLink.item_thumbnail?.thumbnail_image}
                                  alt={singleLink.title}
                                  fill
                                  className="rounded-sm object-cover"
                                />
                              </div>
                            )}
                        </div>
                      </a>
                    </div>
                    <div className={getButtonClasses(nextLink.item_layout)}>
                      <a
                        href={nextLink.url}
                        className="block w-full transition-transform hover:scale-105"
                        onClick={(e) => handleLinkClick(e, nextLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div
                          className={cn(
                            buttonVariants({ size: "lg", variant: "outline" }),
                            "flex w-full items-center justify-center gap-2 border text-center text-wrap shadow-sm hover:opacity-90",
                            nextLink.item_highlight === "outline" && "animate-highlight_outline",
                            nextLink.item_highlight === "border" && "animate-highlight_border",
                            nextLink.item_highlight === "scale" && "animate-highlight_scale",
                            {
                              "flex h-[100px] items-center justify-center":
                                nextLink.item_layout === "square",
                              "flex h-[88px] items-center justify-center":
                                nextLink.item_layout === "double-height",
                              "py-2":
                                nextLink.item_layout !== "double-height" &&
                                nextLink.item_layout !== "square",
                            },
                          )}
                          style={{
                            lineBreak: "anywhere",
                            color: puklaTheme?.button_text_color,
                            borderRadius: puklaTheme?.border_radius,
                            borderColor: puklaTheme?.border_color,
                            backgroundColor: puklaTheme?.button_color,
                          }}
                        >
                          {nextLink.item_thumbnail?.thumbnail_type === "icon" &&
                            nextLink.item_thumbnail?.thumbnail_icon &&
                            nextLink.item_thumbnail?.thumbnail_icon.position === "start" && (
                              <div className="flex items-center justify-center">
                                <DynamicIcon
                                  name={nextLink.item_thumbnail?.thumbnail_icon?.name as any}
                                  className="h-5 w-5"
                                />
                              </div>
                            )}
                          {nextLink.item_thumbnail?.thumbnail_type === "image" &&
                            nextLink.item_thumbnail?.thumbnail_image &&
                            nextLink.item_thumbnail?.position === "start" && (
                              <div className="relative h-5 w-5">
                                <Image
                                  src={nextLink.item_thumbnail?.thumbnail_image}
                                  alt={nextLink.title}
                                  fill
                                  className="rounded-sm object-cover"
                                />
                              </div>
                            )}
                          {nextLink.title}
                          {nextLink.item_thumbnail?.thumbnail_type === "icon" &&
                            nextLink.item_thumbnail?.thumbnail_icon &&
                            nextLink.item_thumbnail?.thumbnail_icon.position === "end" && (
                              <div className="flex items-center justify-center">
                                <DynamicIcon
                                  name={nextLink.item_thumbnail?.thumbnail_icon?.name as any}
                                  className="h-5 w-5"
                                />
                              </div>
                            )}
                          {nextLink.item_thumbnail?.thumbnail_type === "image" &&
                            nextLink.item_thumbnail?.thumbnail_image &&
                            nextLink.item_thumbnail?.position === "end" && (
                              <div className="relative h-5 w-5">
                                <Image
                                  src={nextLink.item_thumbnail?.thumbnail_image}
                                  alt={nextLink.title}
                                  fill
                                  className="rounded-sm object-cover"
                                />
                              </div>
                            )}
                        </div>
                      </a>
                    </div>
                  </div>
                );
              }
              console.log("singleLink", singleLink.item_highlight);

              return (
                <div key={singleLink.id || index} className="flex w-full justify-center">
                  <div className={getButtonClasses(currentLayout)}>
                    <a
                      href={singleLink.url}
                      className="block w-full transition-transform hover:scale-105"
                      onClick={(e) => handleLinkClick(e, singleLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div
                        className={cn(
                          buttonVariants({ size: "lg", variant: "outline" }),
                          "flex w-full items-center justify-center gap-2 border text-center text-wrap shadow-sm hover:opacity-90",
                          singleLink.item_highlight === "outline" && "animate-highlight_outline",
                          singleLink.item_highlight === "border" && "animate-highlight_border",
                          singleLink.item_highlight === "scale" && "animate-highlight_scale",
                          {
                            "flex h-[100px] items-center justify-center":
                              singleLink.item_layout === "square",
                            "flex h-[88px] items-center justify-center":
                              singleLink.item_layout === "double-height",
                            "py-2":
                              singleLink.item_layout !== "double-height" &&
                              singleLink.item_layout !== "square",
                          },
                        )}
                        style={{
                          lineBreak: "anywhere",
                          color: puklaTheme?.button_text_color,
                          borderRadius: puklaTheme?.border_radius,
                          borderColor: puklaTheme?.border_color,
                          backgroundColor: puklaTheme?.button_color,
                        }}
                      >
                        {singleLink.item_thumbnail?.thumbnail_type === "icon" &&
                          singleLink.item_thumbnail?.thumbnail_icon &&
                          singleLink.item_thumbnail?.thumbnail_icon.position === "start" && (
                            <div className="flex items-center justify-center">
                              <DynamicIcon
                                name={singleLink.item_thumbnail?.thumbnail_icon?.name as any}
                                className="h-5 w-5"
                              />
                            </div>
                          )}
                        {singleLink.item_thumbnail?.thumbnail_type === "image" &&
                          singleLink.item_thumbnail?.thumbnail_image &&
                          singleLink.item_thumbnail?.position === "start" && (
                            <div className="relative h-5 w-5">
                              <Image
                                src={singleLink.item_thumbnail?.thumbnail_image}
                                alt={singleLink.title}
                                fill
                                className="rounded-sm object-cover"
                              />
                            </div>
                          )}
                        {singleLink.title}
                        {singleLink.item_thumbnail?.thumbnail_type === "icon" &&
                          singleLink.item_thumbnail?.thumbnail_icon &&
                          singleLink.item_thumbnail?.thumbnail_icon.position === "end" && (
                            <div className="flex items-center justify-center">
                              <DynamicIcon
                                name={singleLink.item_thumbnail?.thumbnail_icon?.name as any}
                                className="h-5 w-5"
                              />
                            </div>
                          )}
                        {singleLink.item_thumbnail?.thumbnail_type === "image" &&
                          singleLink.item_thumbnail?.thumbnail_image &&
                          singleLink.item_thumbnail?.position === "end" && (
                            <div className="relative h-5 w-5">
                              <Image
                                src={singleLink.item_thumbnail?.thumbnail_image}
                                alt={singleLink.title}
                                fill
                                className="rounded-sm object-cover"
                              />
                            </div>
                          )}
                      </div>
                    </a>
                  </div>
                </div>
              );
            })
            .filter(Boolean)}
        </div>
      );
    }

    // For animated version
    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={animation.container}
        className="flex w-full flex-1 flex-col items-center gap-4 px-0"
      >
        {linksToRender
          .map((singleLink: LinkItemProps, index: number) => {
            if (processedIndices.has(index)) return null;

            if (singleLink.item_type === "header") {
              return (
                <motion.div
                  key={singleLink.id || index}
                  variants={animation.item}
                  className="w-full py-4 text-center"
                >
                  <h2 className="text-lg font-bold" style={{ color: puklaTheme?.text_color }}>
                    {singleLink.title}
                  </h2>
                </motion.div>
              );
            }

            const currentLayout = singleLink.item_layout;
            const nextLink = linksToRender[index + 1];
            const isCurrentHalfWidth = isHalfWidthLayout(currentLayout);
            const isNextHalfWidth = nextLink && isHalfWidthLayout(nextLink.item_layout);

            if (isCurrentHalfWidth && isNextHalfWidth) {
              processedIndices.add(index + 1);
              return (
                <motion.div
                  key={`row-${singleLink.id}`}
                  variants={animation.item}
                  className="flex w-full justify-center gap-4"
                >
                  <div className={getButtonClasses(currentLayout)}>
                    <a
                      href={singleLink.url}
                      className="block w-full transition-transform hover:scale-105"
                      onClick={(e) => handleLinkClick(e, singleLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div
                        className={cn(
                          buttonVariants({ size: "lg", variant: "outline" }),
                          "flex w-full items-center justify-center gap-2 border text-center text-wrap shadow-sm hover:opacity-90",
                          singleLink.item_highlight === "outline" && "animate-highlight_outline",
                          singleLink.item_highlight === "border" && "animate-highlight_border",
                          singleLink.item_highlight === "scale" && "animate-highlight_scale",
                          {
                            "flex h-[100px] items-center justify-center":
                              singleLink.item_layout === "square",
                            "flex h-[88px] items-center justify-center":
                              singleLink.item_layout === "double-height",
                            "py-2":
                              singleLink.item_layout !== "double-height" &&
                              singleLink.item_layout !== "square",
                          },
                        )}
                        style={{
                          lineBreak: "anywhere",
                          color: puklaTheme?.button_text_color,
                          borderRadius: puklaTheme?.border_radius,
                          borderColor: puklaTheme?.border_color,
                          backgroundColor: puklaTheme?.button_color,
                        }}
                      >
                        {singleLink.item_thumbnail?.thumbnail_type === "icon" &&
                          singleLink.item_thumbnail?.thumbnail_icon &&
                          singleLink.item_thumbnail?.thumbnail_icon.position === "start" && (
                            <div className="flex items-center justify-center">
                              <DynamicIcon
                                name={singleLink.item_thumbnail?.thumbnail_icon?.name as any}
                                className="h-5 w-5"
                              />
                            </div>
                          )}
                        {singleLink.item_thumbnail?.thumbnail_type === "image" &&
                          singleLink.item_thumbnail?.thumbnail_image &&
                          singleLink.item_thumbnail?.position === "start" && (
                            <div className="relative h-5 w-5">
                              <Image
                                src={singleLink.item_thumbnail?.thumbnail_image}
                                alt={singleLink.title}
                                fill
                                className="rounded-sm object-cover"
                              />
                            </div>
                          )}
                        {singleLink.title}
                        {singleLink.item_thumbnail?.thumbnail_type === "icon" &&
                          singleLink.item_thumbnail?.thumbnail_icon &&
                          singleLink.item_thumbnail?.thumbnail_icon.position === "end" && (
                            <div className="flex items-center justify-center">
                              <DynamicIcon
                                name={singleLink.item_thumbnail?.thumbnail_icon?.name as any}
                                className="h-5 w-5"
                              />
                            </div>
                          )}
                        {singleLink.item_thumbnail?.thumbnail_type === "image" &&
                          singleLink.item_thumbnail?.thumbnail_image &&
                          singleLink.item_thumbnail?.position === "end" && (
                            <div className="relative h-5 w-5">
                              <Image
                                src={singleLink.item_thumbnail?.thumbnail_image}
                                alt={singleLink.title}
                                fill
                                className="rounded-sm object-cover"
                              />
                            </div>
                          )}
                      </div>
                    </a>
                  </div>
                  <div className={getButtonClasses(nextLink.item_layout)}>
                    <a
                      href={nextLink.url}
                      className="block w-full transition-transform hover:scale-105"
                      onClick={(e) => handleLinkClick(e, nextLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div
                        className={cn(
                          buttonVariants({ size: "lg", variant: "outline" }),
                          "flex w-full items-center justify-center gap-2 border text-center text-wrap shadow-sm hover:opacity-90",
                          nextLink.item_highlight === "outline" && "animate-highlight_outline",
                          nextLink.item_highlight === "border" && "animate-highlight_border",
                          nextLink.item_highlight === "scale" && "animate-highlight_scale",
                          {
                            "flex h-[100px] items-center justify-center":
                              nextLink.item_layout === "square",
                            "flex h-[88px] items-center justify-center":
                              nextLink.item_layout === "double-height",
                            "py-2":
                              nextLink.item_layout !== "double-height" &&
                              nextLink.item_layout !== "square",
                          },
                        )}
                        style={{
                          lineBreak: "anywhere",
                          color: puklaTheme?.button_text_color,
                          borderRadius: puklaTheme?.border_radius,
                          borderColor: puklaTheme?.border_color,
                          backgroundColor: puklaTheme?.button_color,
                        }}
                      >
                        {nextLink.item_thumbnail?.thumbnail_type === "icon" &&
                          nextLink.item_thumbnail?.thumbnail_icon &&
                          nextLink.item_thumbnail?.thumbnail_icon.position === "start" && (
                            <div className="flex items-center justify-center">
                              <DynamicIcon
                                name={nextLink.item_thumbnail?.thumbnail_icon?.name as any}
                                className="h-5 w-5"
                              />
                            </div>
                          )}
                        {nextLink.item_thumbnail?.thumbnail_type === "image" &&
                          nextLink.item_thumbnail?.thumbnail_image &&
                          nextLink.item_thumbnail?.position === "start" && (
                            <div className="relative h-5 w-5">
                              <Image
                                src={nextLink.item_thumbnail?.thumbnail_image}
                                alt={nextLink.title}
                                fill
                                className="rounded-sm object-cover"
                              />
                            </div>
                          )}
                        {nextLink.title}
                        {nextLink.item_thumbnail?.thumbnail_type === "icon" &&
                          nextLink.item_thumbnail?.thumbnail_icon &&
                          nextLink.item_thumbnail?.thumbnail_icon.position === "end" && (
                            <div className="flex items-center justify-center">
                              <DynamicIcon
                                name={nextLink.item_thumbnail?.thumbnail_icon?.name as any}
                                className="h-5 w-5"
                              />
                            </div>
                          )}
                        {nextLink.item_thumbnail?.thumbnail_type === "image" &&
                          nextLink.item_thumbnail?.thumbnail_image &&
                          nextLink.item_thumbnail?.position === "end" && (
                            <div className="relative h-5 w-5">
                              <Image
                                src={nextLink.item_thumbnail?.thumbnail_image}
                                alt={nextLink.title}
                                fill
                                className="rounded-sm object-cover"
                              />
                            </div>
                          )}
                      </div>
                    </a>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={singleLink.id || index}
                variants={animation.item}
                className="flex w-full justify-center"
              >
                <div className={getButtonClasses(currentLayout)}>
                  <a
                    href={singleLink.url}
                    className="block w-full transition-transform hover:scale-105"
                    onClick={(e) => handleLinkClick(e, singleLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div
                      className={cn(
                        buttonVariants({ size: "lg", variant: "outline" }),
                        "flex w-full items-center justify-center gap-2 border text-center text-wrap shadow-sm hover:opacity-90",
                        singleLink.item_highlight === "outline" && "animate-highlight_outline",
                        singleLink.item_highlight === "border" && "animate-highlight_border",
                        singleLink.item_highlight === "scale" && "animate-highlight_scale",
                        {
                          "flex h-[100px] items-center justify-center":
                            singleLink.item_layout === "square",
                          "flex h-[88px] items-center justify-center":
                            singleLink.item_layout === "double-height",
                          "py-2":
                            singleLink.item_layout !== "double-height" &&
                            singleLink.item_layout !== "square",
                        },
                      )}
                      style={{
                        lineBreak: "anywhere",
                        color: puklaTheme?.button_text_color,
                        borderRadius: puklaTheme?.border_radius,
                        borderColor: puklaTheme?.border_color,
                        backgroundColor: puklaTheme?.button_color,
                      }}
                    >
                      {singleLink.item_thumbnail?.thumbnail_type === "icon" &&
                        singleLink.item_thumbnail?.thumbnail_icon &&
                        singleLink.item_thumbnail?.thumbnail_icon.position === "start" && (
                          <div className="flex items-center justify-center">
                            <DynamicIcon
                              name={singleLink.item_thumbnail?.thumbnail_icon?.name as any}
                              className="h-5 w-5"
                            />
                          </div>
                        )}
                      {singleLink.item_thumbnail?.thumbnail_type === "image" &&
                        singleLink.item_thumbnail?.thumbnail_image &&
                        singleLink.item_thumbnail?.position === "start" && (
                          <div className="relative h-5 w-5">
                            <Image
                              src={singleLink.item_thumbnail?.thumbnail_image}
                              alt={singleLink.title}
                              fill
                              className="rounded-sm object-cover"
                            />
                          </div>
                        )}
                      {singleLink.title}
                      {singleLink.item_thumbnail?.thumbnail_type === "icon" &&
                        singleLink.item_thumbnail?.thumbnail_icon &&
                        singleLink.item_thumbnail?.thumbnail_icon.position === "end" && (
                          <div className="flex items-center justify-center">
                            <DynamicIcon
                              name={singleLink.item_thumbnail?.thumbnail_icon?.name as any}
                              className="h-5 w-5"
                            />
                          </div>
                        )}
                      {singleLink.item_thumbnail?.thumbnail_type === "image" &&
                        singleLink.item_thumbnail?.thumbnail_image &&
                        singleLink.item_thumbnail?.position === "end" && (
                          <div className="relative h-5 w-5">
                            <Image
                              src={singleLink.item_thumbnail?.thumbnail_image}
                              alt={singleLink.title}
                              fill
                              className="rounded-sm object-cover"
                            />
                          </div>
                        )}
                    </div>
                  </a>
                </div>
              </motion.div>
            );
          })
          .filter(Boolean)}
      </motion.div>
    );
  };

  if (isLoading || !isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div
      dir="ltr"
      // dir={lang === "ar" ? "rtl" : "ltr"}
      className={clsx("relative min-h-screen w-full")}
      style={{
        backgroundColor: puklaTheme?.background_image
          ? "transparent"
          : puklaTheme?.background_color,
      }}
    >
      {/* Background container */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundColor: puklaTheme?.background_image
            ? puklaTheme?.background_color
            : "transparent",
          backgroundImage: puklaTheme?.background_image
            ? `url(${puklaTheme.background_image})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {puklaTheme?.background_image && puklaTheme?.overlay_color && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: puklaTheme.overlay_color,
              opacity: puklaTheme.overlay_opacity ?? 0.5,
            }}
          />
        )}
      </div>

      <MoreOptions
        backgroundColor={puklaTheme?.background_color}
        onShare={() => setOpenShareDialog(true)}
        onReport={() => router.push(`/report?pukla_id=${pukla?.slug}`)}
      />

      {/* <div className="absolute top-4 left-4">
        <LanguageSwitcher
          backgroundColor={puklaTheme?.background_color}
          className="bg-transparent hover:bg-transparent/10"
          style={{
            color: shouldUseLightContent(puklaTheme?.background_color)
              ? "white"
              : "black",
          }}
        />
      </div> */}

      <div
        className={clsx(
          "no-scrollbar z-30 flex w-full flex-1 flex-col items-center overflow-auto px-4 py-8",
        )}
      >
        <div className="flex w-full max-w-sm flex-1 flex-col">
          <div className="border-opacity-20 mb-6 flex flex-col items-center gap-4 border-white p-4 text-white">
            {!puklaSettings?.hide_avatar && (
              <div
                className={cn("mt-10 bg-gray-100", {
                  "h-24 w-24 rounded-full":
                    puklaSettings?.avatar_shape === "circle" || !puklaSettings?.avatar_shape,
                  "h-24 w-24": puklaSettings?.avatar_shape === "square",
                  "h-24 w-32": puklaSettings?.avatar_shape === "horizontal_rectangle",
                  "h-32 w-24": puklaSettings?.avatar_shape === "vertical_rectangle",
                })}
                style={{
                  backgroundImage: `url(${pukla?.avatar_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius:
                    puklaSettings?.avatar_shape === "circle"
                      ? "9999px"
                      : puklaTheme?.avatar_border_radius || "0px",
                }}
              ></div>
            )}
            <div
              className="flex flex-col gap-2"
              style={{ marginTop: puklaSettings?.hide_avatar ? "40px" : "0px" }}
            >
              {!puklaSettings?.hide_title && (
                <div
                  className="text-center text-2xl font-bold"
                  style={{
                    color: puklaTheme?.text_color,
                  }}
                  dir="ltr"
                >
                  {pukla?.title || `@${pukla?.slug}`}
                </div>
              )}
              {!puklaSettings?.hide_bio && pukla?.bio && (
                <div
                  className="text-center"
                  style={{
                    color: puklaTheme?.text_color,
                  }}
                >
                  {pukla?.bio}
                </div>
              )}
            </div>
            {/* Render social links at the top if position is "top" or not specified */}
            {(!puklaSettings?.socials_position || puklaSettings?.socials_position === "top") && (
              <>
                <SocialLinks links={puklaSettings?.social_links} theme={puklaTheme} />
                <Separator className="w-full" />
              </>
            )}
          </div>

          {filteredLinks?.length > 0 && isInitialized && renderLinks()}

          {/* Render social links at the bottom if position is "bottom" */}
          {puklaSettings?.socials_position === "bottom" && (
            <div className="mt-4 mb-4 flex w-full flex-col items-center justify-center gap-4">
              <Separator className="w-full" />
              <SocialLinks links={puklaSettings?.social_links} theme={puklaTheme} />
            </div>
          )}
        </div>

        {!puklaSettings?.hide_watermark && (
          <Link href="/" target="_blank">
            <div className="mt-8 flex w-full max-w-sm items-center justify-center pb-4">
              <Image
                alt="Pukla Logo"
                height={200}
                width={200}
                src={
                  shouldUseLightContent(puklaTheme?.background_color)
                    ? "/assets/pukla-logo-full-white.png"
                    : "/assets/pukla-logo-full-black.png"
                }
                className="h-6 w-auto opacity-75 transition-opacity hover:opacity-100"
              />
            </div>
          </Link>
        )}
      </div>
      <ShareDialog
        openDialog={openShareDialog}
        setOpenDialog={setOpenShareDialog}
        slug={pukla?.slug}
        id={pukla?.id}
        theme={puklaTheme?.theme}
        noPukla={true}
      />
      <PasswordDialog
        open={showPasswordDialog}
        form={passwordForm}
        onSubmit={handlePasswordSubmit}
        error={verificationError}
        onOpenChange={setShowPasswordDialog}
      />
      <AgeVerificationDialog
        open={showAgeDialog}
        form={ageForm}
        onSubmit={handleAgeSubmit}
        error={verificationError}
        onOpenChange={setShowAgeDialog}
      />
    </div>
  );
};

// DO NOT REMOVE

// const LanguageSwitcher = ({
//   defaultSize = false,
//   className,
//   style,
//   backgroundColor,
// }: {
//   defaultSize?: boolean;
//   className?: string;
//   style?: React.CSSProperties;
//   backgroundColor: string;
// }) => {
//   const t = useTranslations("General");
//   const lang = useLocale();
//   const router = useRouter();

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="outline"
//           size="icon"
//           className={cn(
//             "size-8 bg-transparent border-none",
//             shouldUseLightContent(backgroundColor)
//               ? "hover:bg-transparent/90"
//               : "hover:bg-transparent/10"
//           )}
//           style={style}
//         >
//           <Languages />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent
//         align={lang === "ar" ? "start" : "end"}
//         className="shadow-none"
//         style={{
//           borderColor: shouldUseLightContent(backgroundColor)
//             ? "white"
//             : "black",
//           backgroundColor: backgroundColor,
//           color: shouldUseLightContent(backgroundColor) ? "white" : "black",
//         }}
//       >
//         <DropdownMenuRadioGroup
//           value={lang === "en-US" ? "en" : lang}
//           onValueChange={(value) => {
//             router.replace(router.pathname, router.asPath, {
//               locale: value,
//             });
//           }}
//         >
//           <DropdownMenuRadioItem
//             value="ar"
//             className={cn(
//               "hover:!bg-transparent/10 !bg-transparent",
//               shouldUseLightContent(backgroundColor)
//                 ? "text-white hover:!text-white"
//                 : "text-black hover:!text-black"
//             )}
//           >
//             {t("languages.ar")}
//           </DropdownMenuRadioItem>
//           <DropdownMenuRadioItem
//             value="en"
//             className={cn(
//               "hover:!bg-transparent/10 !bg-transparent",
//               shouldUseLightContent(backgroundColor)
//                 ? "text-white hover:!text-white"
//                 : "text-black hover:!text-black"
//             )}
//           >
//             {t("languages.en")}
//           </DropdownMenuRadioItem>
//         </DropdownMenuRadioGroup>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };
