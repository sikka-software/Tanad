import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as Collapsible from "@radix-ui/react-collapsible";
import clsx from "clsx";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SquareSwitch } from "@/components/ui/switch";
//Components
import { SortableList } from "@/components/app/SortableList";
import { DragHandle } from "@/components/app/SortableItem";
import LoadingOverlay from "@/components/app/LoadingOverlay";
import { SingleLinkActionButton } from "@/components/app/SingleLinkActionButton";
// Hooks
import { usePuklaStore } from "@/hooks/use-pukla-store";
import { useMainStore } from "@/hooks/main.store";
import { updateItemStatus } from "@/lib/operations";
import { supabase } from "@/lib/supabase";
// Types
import { SingleHeaderProps } from "@/lib/types";

export default function SingleHeader(
  props: SingleHeaderProps & { puklaId: string; isDeleting: boolean }
) {
  const t = useTranslations();
  const lang = useLocale();
  const contentRef = useRef<any>(null);

  const [lastSubmittedTitle, setLastSubmittedTitle] = useState(props.title);
  // TODO: add disable link handler
  // const { disableLinkHandler } = useMutationDisableLink();
  const isDragging = usePuklaStore((state) => state.isDragging);

  const {
    currentAction,
    setCurrentAction,
    setPuklaItems,
    toggleEditItem,
    updatingStatusId,
    setUpdatingStatusId,
  } = usePuklaStore();

  const {
    itemAction,
    setItemAction,
    headerContentHeight,
    setHeaderContentHeight,
  } = useMainStore();

  const [isUpdating, setIsUpdating] = useState(false);

  const isOpen = itemAction?.id === props.id && itemAction.action !== null;

  useEffect(() => {
    if (contentRef.current) {
      setHeaderContentHeight({
        id: props.id,
        height: isOpen ? contentRef.current.scrollHeight : 0,
      });
    }
  }, [isOpen]);

  const form = useForm({ defaultValues: { title: props.title || "" } });

  const handleUpdateHeader = async (data: { title: string }) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("pukla_links")
        .update({ title: data.title })
        .eq("id", props.id);

      if (error) throw error;

      setPuklaItems((items) =>
        items.map((item) =>
          item.id === props.id ? { ...item, title: data.title } : item
        )
      );

      toggleEditItem(props.id);
      toast.success(t("Editor.header-updated-successfully"));
    } catch (error) {
      console.error("Error updating header:", error);
      toast.error(t("Editor.failed-to-update-header"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleEnabled = async () => {
    setUpdatingStatusId(props.id);
    try {
      await updateItemStatus(props.id, !props.is_enabled, {
        toasts: {
          success: t("Editor.header-status-updated-successfully"),
          error: t("Editor.header-failed-to-update-status"),
        },
      });

      setPuklaItems((items) =>
        items.map((item) =>
          item.id === props.id
            ? { ...item, is_enabled: !props.is_enabled }
            : item
        )
      );
    } catch (error) {
      console.error("Error toggling header status:", error);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (itemAction?.id === props.id && itemAction.action === "delete") {
      setItemAction(props.id, null);
    } else {
      setItemAction(props.id, "delete");
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
              size={"medium"}
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
                style={{ cursor: isDragging ? "grabbing" : "grab" }}
              />
              <div className="flex flex-col items-center gap-2 p-4 w-full">
                <div className="flex flex-row gap-2 w-full">
                  <form
                    onSubmit={form.handleSubmit(handleUpdateHeader)}
                    className="flex items-center justify-between w-full gap-2"
                  >
                    <Controller
                      name="title"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          disabled={!props.is_editing}
                          placeholder={t("Editor.header-title.placeholder")}
                          className={clsx(
                            !props.is_editing &&
                              "border-none disabled:opacity-100 !cursor-default shadow-none overflow-x-auto"
                          )}
                          {...field}
                        />
                      )}
                    />

                    {props.is_editing && (
                      <>
                        <Button
                          type="submit"
                          size="sm"
                          className="min-w-[60px]"
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            t("General.save")
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => toggleEditItem(props.id)}
                          disabled={isUpdating}
                        >
                          {t("General.cancel")}
                        </Button>
                      </>
                    )}
                  </form>
                  <div className="flex items-center gap-2">
                    <SquareSwitch
                      id={props.id}
                      checked={props.is_enabled}
                      onCheckedChange={handleToggleEnabled}
                    />
                    {/* {lang === "ar" ? (
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
                    )} */}

                    <SingleLinkActionButton
                      tooltip={<div>{t("General.edit")}</div>}
                      icon={<Pencil className="icon_size" />}
                      handleClick={(e) => {
                        e.preventDefault();
                        form.reset({
                          title: lastSubmittedTitle,
                        });
                        toggleEditItem(props.id);
                      }}
                    />
                    <SingleLinkActionButton
                      tooltip={<div>{t("General.delete")}</div>}
                      icon={<Trash2 className="icon_size" />}
                      handleClick={handleDeleteClick}
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
                  headerContentHeight.id === props.id
                    ? headerContentHeight.height
                    : 0,
              }}
            >
              <div ref={contentRef}>
                <div className="">
                  {itemAction?.action && (
                    <div className="bg-muted border-b  text-center py-1">
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
              className="border-singleLinkDraftHintBorder  bg-singleLinkDraftHintBG w-full rounded-b border-[1px] border-t-0 p-2"
            >
              Here's a hint that can be seen when in draft mode
            </div>
          )}
        </div>
      </div>
    </SortableList.Item>
  );
}
