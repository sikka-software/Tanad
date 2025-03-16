import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useTranslations, useLocale } from "next-intl";
import clsx from "clsx";
import {
  Pencil,
  Trash2,
  Loader2,
  Star,
  Lock,
  LayoutPanelTop,
  ImageIcon,
} from "lucide-react";
// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LTRSquareSwitch, RTLSquareSwitch } from "@/components/ui/switch";
// Components
import { SortableList } from "@/components/app/SortableList";
import { SingleLinkActionButton } from "@/components/app/SingleLinkActionButton";
import LoadingOverlay from "@/components/app/LoadingOverlay";
import { DragHandle } from "@/components/app/SortableItem";
// Hooks
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { usePuklaStore } from "@/hooks/use-pukla-store";
import { useMainStore } from "@/hooks/main.store";
// Lib
import { LinkItemProps } from "@/lib/types";
import { updateItemStatus, updateLink } from "@/lib/operations";
import { cn } from "@/lib/utils";

type SingleLinkBoxProps = LinkItemProps & {
  children?: React.ReactNode;
  isLoading?: boolean;
  puklaId: string;
};
export default function SingleLink(props: SingleLinkBoxProps) {
  // const { createLinkHandler, loading } = useMutationManageLinks();
  // const { disableLinkHandler } = useMutationDisableLink();
  const t = useTranslations();
  const lang = useLocale();
  const contentRef = useRef<HTMLDivElement>(null);
  const size = useBreakpoint();

  const {
    handleEditDone,
    toggleEditItem,
    toggleExpandItem,

    setCurrentAction,
    handleDisableLink,
    isLinkLoading,
    setPuklaItems,
    updatingStatusId,
    setUpdatingStatusId,
  } = usePuklaStore((state) => state);

  const { itemAction, setItemAction, linkContentHeight, setLinkContentHeight } =
    useMainStore();
  const [isOpen, setIsOpen] = useState(false);

  // Add a new useEffect specifically for content height updates
  useEffect(() => {
    // Small delay to ensure new content is rendered
    const timer = setTimeout(() => {
      if (contentRef.current) {
        const newHeight = contentRef.current.scrollHeight;
        setLinkContentHeight({
          id: props.id,
          height: isOpen ? newHeight : 0,
        });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [props.children, isOpen, props.id, setLinkContentHeight]);

  // Keep the existing useEffect for open/close state
  useEffect(() => {
    setIsOpen(itemAction?.id === props.id && itemAction.action !== null);
  }, [itemAction, props.id]);

  const [lastSubmittedTitle, setLastSubmittedTitle] = useState(props.title);
  const [lastSubmittedUrl, setLastSubmittedUrl] = useState(props.url);

  const { handleSubmit, control, formState, watch, reset } = useForm({
    defaultValues: {
      title: props.title,
      url: props.url,
    },
  });
  const titleValue = watch("title");
  const urlValue = watch("url");

  const isTitleDirty = formState.dirtyFields.title;
  const isUrlDirty = formState.dirtyFields.url;

  const isTitleNotEmpty = titleValue && titleValue.trim() !== "";
  const isUrlNotEmpty = urlValue && urlValue.trim() !== "";

  const isTitleChangedSinceLastSubmit = titleValue !== lastSubmittedTitle;
  const isUrlChangedSinceLastSubmit = urlValue !== lastSubmittedUrl;

  const showSaveButton =
    (props.is_editing &&
      props.is_enabled &&
      isTitleDirty &&
      isTitleNotEmpty &&
      isTitleChangedSinceLastSubmit) ||
    (isUrlDirty && isUrlNotEmpty && isUrlChangedSinceLastSubmit);

  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateLink = async (data: any) => {
    try {
      setIsUpdating(true);

      if (isTitleChangedSinceLastSubmit || isUrlChangedSinceLastSubmit) {
        const updates = {
          ...(isTitleChangedSinceLastSubmit && { title: data.title }),
          ...(isUrlChangedSinceLastSubmit && { url: data.url }),
        };

        await updateLink(props.id, updates, {
          toasts: {
            success: t("Editor.link_updated_successfully"),
            error: t("Editor.failed-to-update-link"),
          },
        });

        setLastSubmittedTitle(data.title);
        setLastSubmittedUrl(data.url);
      }

      // Exit edit mode after successful update
      toggleEditItem(props.id);
    } catch (error) {
      console.error("Error updating link:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    setItemAction(props.id, action);
    if (itemAction?.id === props.id && itemAction.action === action) {
      setItemAction(props.id, null);
    } else {
      setItemAction(props.id, action);
    }
  };

  const isDragging = usePuklaStore((state) => state.isDragging);

  const handleToggleEnabled = async () => {
    try {
      setUpdatingStatusId(props.id);
      await updateItemStatus(props.id, !props.is_enabled, {
        toasts: {
          success: t("Editor.link-status-updated-successfully"),
          error: t("Editor.link-failed-to-update-status"),
        },
      });

      // Update local state
      setPuklaItems((items: LinkItemProps[]) =>
        items.map((item) =>
          item.id === props.id
            ? { ...item, is_enabled: !item.is_enabled }
            : item
        )
      );
    } catch (error) {
      console.error("Error toggling item status:", error);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <SortableList.Item id={props.id}>
      <div className="flex w-full flex-row gap-2">
        <div className="flex flex-col w-full transition-all relative">
          {(props.isDeleting || updatingStatusId === props.id) && (
            <LoadingOverlay
              dir={lang === "ar" ? "rtl" : "ltr"}
              isLoading={true}
              className={clsx(
                updatingStatusId === props.id && "bg-background/50",
                props.isDeleting && "bg-background/50"
              )}
            />
          )}
          <Collapsible.Root
            className={clsx(
              "bg-background outline outline-1 outline-border transition-all",
              props.is_draft && !isOpen ? "rounded rounded-b-none" : "rounded"
            )}
            dir={lang === "ar" ? "rtl" : "ltr"}
            open={isOpen}
          >
            <div
              className={clsx(
                "flex w-full flex-row items-stretch justify-between p-0 transition-all",
                isOpen ? "border-b" : "border-none",
                props.is_draft
                  ? "border-red-500 border-[1px] rounded-b-none"
                  : ""
              )}
            >
              <DragHandle
                style={{
                  cursor: isDragging ? "grabbing" : "grab",
                  // userSelect: "none",
                }}
              />

              <div className="flex flex-col items-center gap-2 p-4 w-full">
                <div className="flex flex-row gap-2 w-full">
                  <form
                    noValidate
                    onSubmit={handleSubmit(handleUpdateLink)}
                    className="w-full"
                  >
                    <div
                      className={clsx(
                        "flex h-full flex-row gap-3 w-full",
                        props.is_enabled ? "opacity-100" : "opacity-40"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-full flex-col  w-full",
                          props.is_editing && "gap-2"
                        )}
                      >
                        <Controller
                          name="title"
                          control={control}
                          render={({ field }) => (
                            <Input
                              disabled={!props.is_editing}
                              placeholder={t("Editor.single_link_title")}
                              className={cn(
                                "transition-all font-medium",
                                !props.is_editing &&
                                  "border-none disabled:opacity-100 !cursor-default shadow-none overflow-x-auto h-6"
                              )}
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="url"
                          control={control}
                          render={({ field }) => (
                            <Input
                              dir="ltr"
                              disabled={!props.is_editing}
                              placeholder={t("Editor.single_link_url")}
                              className={cn(
                                "transition-all",
                                lang === "ar" && "text-right",
                                !props.is_editing &&
                                  "border-none disabled:opacity-100 !cursor-default overflow-x-auto h-6"
                              )}
                              {...field}
                            />
                          )}
                        />
                      </div>
                      {showSaveButton && (
                        <div className="flex flex-col gap-2">
                          <Button
                            type="submit"
                            className="flex min-w-20"
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              t("General.save")
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              reset({
                                title: lastSubmittedTitle,
                                url: lastSubmittedUrl,
                              });
                            }}
                          >
                            {t("General.cancel")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </form>

                  <div className="flex flex-row items-start justify-end gap-2">
                    {lang === "ar" ? (
                      <RTLSquareSwitch
                        id={props.id}
                        is_enabled={props.is_enabled || false}
                        handleToggleEnabled={handleToggleEnabled}
                        enabled_text={t("General.enabled")}
                        disabled_text={t("General.disabled")}
                      />
                    ) : (
                      <LTRSquareSwitch
                        id={props.id}
                        is_enabled={props.is_enabled || false}
                        handleToggleEnabled={handleToggleEnabled}
                        enabled_text={t("General.enabled")}
                        disabled_text={t("General.disabled")}
                      />
                    )}
                  </div>
                </div>

                <div className="flex w-full">
                  {/* Desktop */}
                  <div className="flex flex-row w-full md:justify-between gap-2">
                    <div className="flex flex-row gap-2 w-full">
                      <SingleLinkActionButton
                        tooltip={<div>{t("General.edit")}</div>}
                        icon={<Pencil className="icon_size" />}
                        handleClick={(e) => {
                          e.preventDefault();
                          reset({
                            title: lastSubmittedTitle,
                            url: lastSubmittedUrl,
                          });
                          toggleEditItem(props.id);
                        }}
                      />
                      <SingleLinkActionButton
                        tooltip={<div>{t("General.lock")}</div>}
                        icon={<Lock className="icon_size" />}
                        handleClick={(e) => handleActionClick(e, "lock")}
                      />
                      <SingleLinkActionButton
                        tooltip={<div>{t("General.highlight")}</div>}
                        icon={<Star className="icon_size" />}
                        handleClick={(e) => handleActionClick(e, "highlight")}
                      />
                      <SingleLinkActionButton
                        tooltip={<div>{t("General.layout")}</div>}
                        icon={<LayoutPanelTop className="icon_size" />}
                        handleClick={(e) => handleActionClick(e, "layout")}
                      />
                      <SingleLinkActionButton
                        tooltip={<div>{t("General.thumbnail")}</div>}
                        icon={<ImageIcon className="icon_size" />}
                        handleClick={(e) => handleActionClick(e, "thumbnail")}
                      />
                    </div>
                    <SingleLinkActionButton
                      tooltip={<div>{t("General.delete")}</div>}
                      icon={<Trash2 className="icon_size" />}
                      handleClick={(e) => handleActionClick(e, "delete")}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Collapsible.Content
              forceMount
              className={clsx(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isOpen ? "opacity-100" : "opacity-0"
              )}
              style={{
                height:
                  linkContentHeight.id === props.id
                    ? linkContentHeight.height
                    : 0,
              }}
            >
              <div ref={contentRef}>
                <div>
                  {itemAction?.action && (
                    <div className="bg-muted border-b text-center py-1">
                      {t(`General.${itemAction?.action}`)}
                    </div>
                  )}
                  <div className="p-4">{props.children}</div>
                </div>
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
          {props.is_draft && !isOpen && (
            <div
              dir={lang === "ar" ? "rtl" : "ltr"}
              className="w-full rounded-b border-[1px] border-t-0 p-2"
            >
              Here's a hint that can be seen when in draft mode
            </div>
          )}
        </div>
      </div>
    </SortableList.Item>
  );
}
