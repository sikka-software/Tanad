"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Switch } from "@/components/ui/switch";

import { getMenuList, applyCustomMenuOrder, type SidebarMenuGroupProps } from "@/lib/sidebar-list";

import useUserStore from "@/hooks/use-user-store";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";

interface SortableItemProps {
  item: SidebarMenuGroupProps["items"][number];
  title: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const SortableItem = ({ item, title, enabled, onToggle }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.title,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSwitchChange = (checked: boolean) => {
    console.log(`Switch toggled for ${item.title}: ${checked}`);
    onToggle(checked);
  };

  // Switch component with stopPropagation to prevent drag conflicts
  const SwitchControl = () => (
    <div
      className="relative z-10 flex items-center cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        // Manually trigger the switch change when clicking the wrapper
        handleSwitchChange(!enabled);
      }}
      onPointerDown={(e) => {
        // Stop propagation to prevent triggering the drag
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Switch
        checked={enabled}
        onCheckedChange={handleSwitchChange}
        aria-label={`Toggle ${title} visibility`}
        className="data-[state=checked]:bg-primary pointer-events-none"
      />
    </div>
  );

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
      <span className="flex-1">{title}</span>
      {item.is_active && (
        <span className="text-primary bg-primary/10 mr-2 rounded-full px-2 py-1 text-xs font-medium">
          Active
        </span>
      )}

      {/* Directly use SwitchControl and remove redundant wrapper */}
      <SwitchControl />
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

  // Get user from the existing store to get profile_id
  const { user } = useUserStore();
  const profile_id = user?.id || "";

  // Use the profile hook to fetch data
  const { data: profile } = useProfile(profile_id);

  // Initialize the update mutation
  const updateProfileMutation = useUpdateProfile();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Add state to track enabled/disabled items
  const [enabledItems, setEnabledItems] = useState<Record<string, Record<string, boolean>>>({});

  // Create a memoized version of enabledItems to use in the dependency array
  const enabledItemsRef = useRef(enabledItems);
  useEffect(() => {
    enabledItemsRef.current = enabledItems;
  }, [enabledItems]);

  // Update parent component when isDirty changes
  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  // Load menu configuration from profile if available
  useEffect(() => {
    console.log("Profile or pathname changed, updating menu configuration");

    // Add debugging on each render to see the profile structure
    console.log("Current profile in SidebarSettings:", profile);

    if (!profile) {
      console.log("No profile available yet, skipping menu configuration");
      return;
    }

    // Only initialize once when profile is loaded
    // or when hidden_menu_items changes
    const currentMenu = getMenuList(pathname);

    // Initialize the enabledItems state regardless of profile data
    // This ensures we always have a valid state to work with
    const initialEnabledState: Record<string, Record<string, boolean>> = {};

    // First initialize all items as enabled
    Object.entries(currentMenu).forEach(([groupName, items]) => {
      initialEnabledState[groupName] = {};
      items.forEach((item) => {
        initialEnabledState[groupName][item.title] = true;
      });
    });

    // Then if we have hidden items data, apply it
    if (profile?.user_settings?.hidden_menu_items) {
      const hiddenItems = profile.user_settings.hidden_menu_items as Record<string, string[]>;

      Object.entries(hiddenItems).forEach(([groupName, hiddenItemsList]) => {
        if (initialEnabledState[groupName]) {
          hiddenItemsList.forEach((itemTitle) => {
            if (initialEnabledState[groupName][itemTitle] !== undefined) {
              initialEnabledState[groupName][itemTitle] = false;
            }
          });
        }
      });
    }

    // Compare new state with current state to avoid unnecessary updates
    const currentEnabledItemsString = JSON.stringify(enabledItems);
    const newEnabledItemsString = JSON.stringify(initialEnabledState);

    if (currentEnabledItemsString !== newEnabledItemsString) {
      console.log("Updating enabledItems state");
      setEnabledItems(initialEnabledState);
    }

    // Load the ordered menu as before
    if (profile?.user_settings && "navigation" in profile.user_settings) {
      try {
        // Use the applyCustomMenuOrder function to get a correctly ordered menu
        const savedNavigation = profile.user_settings.navigation as Record<
          string,
          Array<{ title: string }>
        >;
        const orderedMenu = applyCustomMenuOrder(currentMenu, savedNavigation);

        // Compare ordered menu with current menu to avoid unnecessary updates
        const currentMenuString = JSON.stringify(menuList);
        const newMenuString = JSON.stringify(orderedMenu);

        if (currentMenuString !== newMenuString) {
          console.log("Updating menuList state");
          setMenuList(orderedMenu);
        }
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

  // Handler for toggling item visibility
  const handleToggleItem = useCallback(
    (groupName: string, itemTitle: string, enabled: boolean) => {
      console.log(`Toggle item: ${groupName} / ${itemTitle} to ${enabled}`);

      // Check if the value is actually changing before updating state
      if (enabledItemsRef.current[groupName]?.[itemTitle] === enabled) {
        console.log("Value didn't change, skipping update");
        return;
      }

      // Create deep copy to ensure state update
      const newEnabledItems = { ...enabledItemsRef.current };

      // Initialize group if it doesn't exist
      if (!newEnabledItems[groupName]) {
        newEnabledItems[groupName] = {};
      }

      // Update the specific item's enabled state
      newEnabledItems[groupName][itemTitle] = enabled;

      console.log("New enabled items state:", newEnabledItems);
      setEnabledItems(newEnabledItems);

      // Mark form as dirty to enable the save button
      setIsDirty(true);
    },
    [setIsDirty],
  );

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
          is_active: item.is_active,
          action: item.action,
        }));
      });

      // Create a record of hidden menu items
      const hiddenMenuItems: Record<string, string[]> = {};

      Object.entries(enabledItems).forEach(([groupName, items]) => {
        hiddenMenuItems[groupName] = [];
        Object.entries(items).forEach(([itemTitle, enabled]) => {
          if (!enabled) {
            hiddenMenuItems[groupName].push(itemTitle);
          }
        });
        // Remove empty arrays
        if (hiddenMenuItems[groupName].length === 0) {
          delete hiddenMenuItems[groupName];
        }
      });

      console.log("Saving navigation settings:", simplifiedMenuList);
      console.log("Saving hidden menu items:", hiddenMenuItems);

      // Get current user settings to ensure we're not overwriting anything
      const currentUserSettings = profile?.user_settings || {};

      // Save menu configuration to profile
      const result = await updateProfileMutation.mutateAsync({
        profile_id,
        data: {
          user_settings: {
            ...currentUserSettings,
            navigation: simplifiedMenuList,
            hidden_menu_items: hiddenMenuItems,
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
              <h3 className="text-sm font-medium">{t(`${groupName}.title`)}</h3>
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
                    {items.map((item) => {
                      // Get the enabled state for this item, defaulting to true if not defined
                      const isEnabled = enabledItems[groupName]?.[item.title] ?? true;
                      console.log(
                        `Rendering item ${groupName}/${item.title} with enabled=${isEnabled}`,
                      );

                      return (
                        <SortableItem
                          key={item.title}
                          item={item}
                          title={t(`${item.title}.title`)}
                          enabled={isEnabled}
                          onToggle={(enabled) => handleToggleItem(groupName, item.title, enabled)}
                        />
                      );
                    })}
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
