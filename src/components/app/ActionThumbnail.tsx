import { useTranslations } from "next-intl";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Loader2, Search } from "lucide-react";
import * as LucideIcons from "lucide-react";
import Image from "next/image";
import { useVirtualizer } from "@tanstack/react-virtual";
import debounce from "lodash/debounce";
import { toast } from "sonner";

import { usePuklaStore } from "@/hooks/use-pukla-store";
import useMainStore from "@/hooks/main.store";
import useUserStore from "@/hooks/use-user-store";

import { cn } from "@/lib/utils";
import { updateLink } from "@/lib/operations";
import { iconNames } from "@/lib/constants/icons-names";
import { IconPosition, ThumbnailIcon } from "@/lib/types";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ActionThumbnailProps = {
  linkId: string;
  currentThumbnailType?: "icon" | "image";
  currentThumbnailIcon?: ThumbnailIcon;
  currentThumbnailImage?: string;
  onUpgradeNeeded?: () => void;
  onClose?: () => void;
};

const ICON_SIZE = 40; // 10 * 4 (h-10 w-10)
const ICON_GAP = 8; // gap-2 = 8px
const GRID_COLUMNS = 6;
const SCROLL_HEIGHT = 200; // h-[200px]
const ICONS_PER_PAGE = 100; // Number of icons to load at once

const ActionThumbnail = ({
  linkId,
  currentThumbnailType,
  currentThumbnailIcon,
  currentThumbnailImage,
  onUpgradeNeeded,
  onClose,
}: ActionThumbnailProps) => {
  const t = useTranslations();
  const { user } = useUserStore();
  const [selectedTab, setSelectedTab] = useState<"icon" | "image">(
    currentThumbnailType || "icon"
  );
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(
    currentThumbnailIcon?.name
  );
  const [iconPosition, setIconPosition] = useState<IconPosition>(
    currentThumbnailIcon?.position || "start"
  );
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    currentThumbnailImage
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadedIconCount, setLoadedIconCount] = useState(ICONS_PER_PAGE);
  const { setPuklaItems } = usePuklaStore();
  const { selectedPukla } = useMainStore();
  const [loadingRemoveThumbnail, setLoadingRemoveThumbnail] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Update the state when props change
  useEffect(() => {
    setSelectedTab(currentThumbnailType || "icon");
    setSelectedIcon(currentThumbnailIcon?.name);
    setIconPosition(currentThumbnailIcon?.position || "start");
    setSelectedImage(currentThumbnailImage);
  }, [currentThumbnailType, currentThumbnailIcon, currentThumbnailImage]);

  // Memoize the filtered icons
  const filteredIcons = useMemo(() => {
    console.log("Filtering icons:", { searchQuery, loadedIconCount });
    const searchLower = searchQuery.toLowerCase();
    const allIcons = Object.entries(iconNames);
    console.log("Total icons available:", allIcons.length);

    let result;
    if (searchLower) {
      result = allIcons.filter(([name, tags]) => {
        return (
          name.toLowerCase().includes(searchLower) ||
          tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
        );
      });
    } else {
      result = allIcons.slice(0, loadedIconCount);
    }

    console.log("Filtered icons count:", result.length);
    return result;
  }, [searchQuery, loadedIconCount]);

  // Calculate rows for virtualization
  const rows = Math.ceil(filteredIcons.length / GRID_COLUMNS);

  // Create a container ref for the virtualized content
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle scroll to load more icons
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || searchQuery) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const scrollPosition = scrollTop + clientHeight;

    // If we're near the bottom and not searching, load more icons
    if (scrollHeight - scrollPosition < 100) {
      setLoadedIconCount((prev) =>
        Math.min(prev + ICONS_PER_PAGE, Object.keys(iconNames).length)
      );
    }
  }, [searchQuery]);

  // Set up virtualization with optimized settings
  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => scrollRef.current,
    estimateSize: useCallback(() => ICON_SIZE + ICON_GAP, []),
    overscan: 5,
    initialRect: { width: 0, height: SCROLL_HEIGHT },
  });

  // Force recalculation when filteredIcons changes
  useEffect(() => {
    rowVirtualizer.measure();
  }, [filteredIcons, rowVirtualizer]);

  // Add scroll event listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Debounce search input with cleanup
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 300),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (user?.subscribed_to === "pukla_free") {
        onUpgradeNeeded?.();
        return;
      }

      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("Theme.image_too_large"));
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error(t("Theme.invalid_file_type"));
        return;
      }

      // Create temporary URL for preview
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(previewUrl);
      setSelectedFile(file);

      // Cleanup function to revoke the URL when component unmounts
      return () => URL.revokeObjectURL(previewUrl);
    },
    [t, user?.subscribed_to, onUpgradeNeeded]
  );

  const handleSave = useCallback(async () => {
    if (user?.subscribed_to === "pukla_free") {
      onUpgradeNeeded?.();
      return;
    }
    if (!selectedPukla?.id || !linkId) {
      return;
    }

    setIsLoading(true);
    try {
      if (selectedTab === "icon") {
        const thumbnailData = selectedIcon
          ? {
              name: selectedIcon,
              position: iconPosition,
            }
          : undefined;

        const updateData = {
          item_thumbnail: {
            thumbnail_type: selectedTab,
            thumbnail_icon: thumbnailData,
          },
        };

        await updateLink(linkId, updateData, {
          toasts: {
            success: t("Editor.link_updated_successfully"),
            error: t("Editor.failed_to_update_link"),
          },
        });

        setPuklaItems((items) => {
          return items.map((item) =>
            item.id === linkId
              ? { ...item, item_thumbnail: updateData.item_thumbnail }
              : item
          );
        });
      }

      if (selectedTab === "image") {
        if (selectedFile) {
          // Generate a unique file name
          const fileExt = selectedFile.name.split(".").pop();
          const fileName = `${linkId}-${Date.now()}.${fileExt}`;

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("pukla_item_thumbnails")
              .upload(fileName, selectedFile);

          if (uploadError) throw uploadError;

          // Get the public URL
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("pukla_item_thumbnails")
            .getPublicUrl(fileName);

          const updateData = {
            item_thumbnail: {
              thumbnail_type: "image" as const,
              thumbnail_image: publicUrl,
              position: iconPosition,
            },
          };

          await updateLink(linkId, updateData, {
            toasts: {
              success: t("Editor.link_updated_successfully"),
              error: t("Editor.failed_to_update_link"),
            },
          });

          setPuklaItems((items) => {
            return items.map((item) =>
              item.id === linkId
                ? { ...item, item_thumbnail: updateData.item_thumbnail }
                : item
            );
          });
        }
      }

      onClose?.();
    } catch (error) {
      console.error("Error updating thumbnail:", error);
      toast.error(t("Editor.failed_to_update_link"));
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedPukla?.id,
    linkId,
    selectedTab,
    selectedIcon,
    iconPosition,
    selectedFile,
    t,
    setPuklaItems,
    onClose,
    user?.subscribed_to,
    onUpgradeNeeded,
  ]);

  const handleRemoveThumbnail = async () => {
    setLoadingRemoveThumbnail(true);
    try {
      const updateData = { item_thumbnail: null };

      await updateLink(linkId, updateData, {
        toasts: {
          success: t("Editor.link_updated_successfully"),
          error: t("Editor.failed_to_update_link"),
        },
      });

      setPuklaItems((items) => {
        return items.map((item) =>
          item.id === linkId
            ? { ...item, item_thumbnail: updateData.item_thumbnail }
            : item
        );
      });

      setSelectedTab(currentThumbnailType || "icon");
      setSelectedIcon(undefined);
      setIconPosition("start");
      setSelectedImage(undefined);
    } catch (error) {
      console.error("Error removing thumbnail:", error);
    } finally {
      setLoadingRemoveThumbnail(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <span>{t("Editor.change_thumbnail")}</span>
        {currentThumbnailType && (
          <Button variant="outline" onClick={handleRemoveThumbnail}>
            {loadingRemoveThumbnail ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("Editor.remove_thumbnail")
            )}
          </Button>
        )}
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={(value) => {
          setSelectedTab(value as "icon" | "image");
          setSearchQuery(""); // Reset search query when changing tabs
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="icon">
            {t("Editor.thumbnail.choose_icon")}
          </TabsTrigger>
          <TabsTrigger value="image">
            {t("Editor.thumbnail.choose_image")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="icon" className="mt-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("Editor.search_icons")}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="ps-9"
              />
            </div>
            {selectedIcon && (
              <Select
                value={iconPosition}
                onValueChange={(value) =>
                  setIconPosition(value as IconPosition)
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("Editor.thumbnail.icon_position")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">
                    {t("Editor.thumbnail.position_start")}
                  </SelectItem>
                  <SelectItem value="end">
                    {t("Editor.thumbnail.position_end")}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            <div
              ref={scrollRef}
              className="h-[200px] overflow-auto rounded-md border p-4"
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const rowStart = virtualRow.index * GRID_COLUMNS;
                  const rowIcons = filteredIcons.slice(
                    rowStart,
                    rowStart + GRID_COLUMNS
                  );

                  return (
                    <div
                      key={virtualRow.index}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${ICON_SIZE}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className="flex gap-2 justify-center"
                    >
                      {rowIcons.map(([iconName]) => {
                        // Convert kebab-case to PascalCase for Lucide icons
                        const formattedIconName =
                          iconName
                            .split("-")
                            .map(
                              (part) =>
                                part.charAt(0).toUpperCase() + part.slice(1)
                            )
                            .join("") + "Icon";

                        const Icon = (LucideIcons as any)[formattedIconName];

                        return (
                          <Button
                            key={iconName}
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-10 w-10 relative group",
                              selectedIcon === iconName && "border-primary"
                            )}
                            onClick={() => setSelectedIcon(iconName)}
                          >
                            {Icon ? (
                              <Icon className="h-4 w-4" />
                            ) : (
                              <div className="h-4 w-4 flex items-center justify-center text-xs">
                                ?
                              </div>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          <div className="flex flex-col gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
            {selectedImage && (
              <>
                <Select
                  value={iconPosition}
                  onValueChange={(value) =>
                    setIconPosition(value as IconPosition)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("Editor.thumbnail.icon_position")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="start">
                      {t("Editor.thumbnail.position_start")}
                    </SelectItem>
                    <SelectItem value="end">
                      {t("Editor.thumbnail.position_end")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative h-32 w-32 rounded-md border">
                  <Image
                    src={selectedImage}
                    alt="Thumbnail preview"
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Button
        variant="default"
        className="w-full"
        onClick={handleSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          t("Editor.save")
        )}
      </Button>
    </div>
  );
};

export default ActionThumbnail;
