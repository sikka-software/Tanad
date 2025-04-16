"use client";

import { useState, useEffect } from "react";
import React from "react";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { getMenuList, applyCustomMenuOrder, type SidebarMenuGroupProps } from "@/lib/sidebar-list";

import useUserStore from "@/hooks/use-user-store";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";

interface SortableItemProps {
  item: SidebarMenuGroupProps["items"][number];
}

const SortableItem = ({ item }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.title,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="hover:bg-accent flex cursor-grab items-center gap-3 rounded-md border p-3 active:cursor-grabbing"
    >
      <GripVertical className="text-muted-foreground h-4 w-4" />
      <span className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{item.title}</span>
      {item.isActive && (
        <span className="text-primary bg-primary/10 rounded-full px-2 py-1 text-xs font-medium">
          Active
        </span>
      )}
    </div>
  );
};

interface SidebarSettingsProps {
  onDirtyChange?: (isDirty: boolean) => void;
  onSave?: () => void;
  onSaveComplete?: () => void;
  isSaving?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

const SidebarSettings = ({
  onDirtyChange,
  onSave,
  onSaveComplete,
  isSaving,
  formRef,
}: SidebarSettingsProps = {}) => {
  const lang = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const [isDirty, setIsDirty] = useState(false);
  const [menuList, setMenuList] = useState(getMenuList(pathname));

  // Get user from the existing store to get profileId
  const { user } = useUserStore();
  const profileId = user?.id || "";

  // Use the profile hook to fetch data
  const { data: profile } = useProfile(profileId);

  // Initialize the update mutation
  const updateProfileMutation = useUpdateProfile();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Update parent component when isDirty changes
  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  // Load menu configuration from profile if available
  useEffect(() => {
    // Add debugging on each render to see the profile structure
    console.log("Current profile in SidebarSettings:", profile);
    console.log("Current user settings:", profile?.user_settings);
    console.log(
      "Does navigation exist?",
      profile?.user_settings && "navigation" in profile.user_settings,
    );

    if (profile?.user_settings && "navigation" in profile.user_settings) {
      try {
        // Use the applyCustomMenuOrder function to get a correctly ordered menu
        const currentMenu = getMenuList(pathname);
        console.log("Profile navigation settings:", profile.user_settings.navigation);
        console.log("Current default menu:", currentMenu);

        const savedNavigation = profile.user_settings.navigation as Record<
          string,
          Array<{ title: string }>
        >;
        const orderedMenu = applyCustomMenuOrder(currentMenu, savedNavigation);
        console.log("Ordered menu after applying saved order:", orderedMenu);

        setMenuList(orderedMenu);
      } catch (error) {
        console.error("Error loading menu configuration:", error);
      }
    }
  }, [profile, pathname]);

  const handleDragEnd = (event: DragEndEvent, groupName: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = menuList[groupName].findIndex((item) => item.title === active.id);
      const newIndex = menuList[groupName].findIndex((item) => item.title === over.id);

      setMenuList((prev) => ({
        ...prev,
        [groupName]: arrayMove(prev[groupName], oldIndex, newIndex),
      }));
      setIsDirty(true);
    }
  };

  const handleInputChange = () => {
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();

    if (onSave) onSave();

    try {
      // When saving to the database, we need to simplify the menu structure
      // to avoid issues with circular references and complex objects like icon components
      const simplifiedMenuList: Record<string, any[]> = {};

      Object.entries(menuList).forEach(([groupName, items]) => {
        simplifiedMenuList[groupName] = items.map((item) => ({
          title: item.title,
          translationKey: item.translationKey,
          url: item.url,
          isActive: item.isActive,
          action: item.action,
        }));
      });

      console.log("Saving navigation settings:", simplifiedMenuList);

      // Get current user settings to ensure we're not overwriting anything
      const currentUserSettings = profile?.user_settings || {};

      // Save menu configuration to profile
      const result = await updateProfileMutation.mutateAsync({
        profileId,
        data: {
          user_settings: {
            ...currentUserSettings,
            navigation: simplifiedMenuList,
          },
        },
      });

      console.log("Navigation settings saved successfully. Updated profile:", result);
      setIsDirty(false);
      if (onSaveComplete) onSaveComplete();
    } catch (error) {
      console.error("Error saving navigation settings:", error);
      if (onSaveComplete) onSaveComplete();
    }
  };

  return (
    <Card className="shadow-none">
      <CardHeader dir={lang === "ar" ? "rtl" : "ltr"}>
        <CardTitle>{t("Settings.navigation.title")}</CardTitle>
        <CardDescription>{t("Settings.navigation.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
        <form ref={formRef} onSubmit={handleSubmit}>
          {Object.entries(menuList).map(([groupName, items]) => (
            <div key={groupName} className="space-y-4">
              <h3 className="text-sm font-medium">{groupName}</h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, groupName)}
              >
                <SortableContext
                  items={items.map((item) => item.title)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {items.map((item) => (
                      <SortableItem key={item.title} item={item} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ))}
        </form>
      </CardContent>
    </Card>
  );
};

export default SidebarSettings;
