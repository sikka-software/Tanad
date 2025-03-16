import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslations, useLocale } from "next-intl";
// Components
import ConfirmDeleteLink from "@/components/app/ConfirmDelete";
import LoadingOverlay from "@/components/app/LoadingOverlay";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import SingleHeader from "@/components/app/SingleHeader";
import SingleLink from "@/components/app/SingleLink";
import { SortableList } from "@/components/app/SortableList";
import { NewLinkBox } from "@/components/app/NewLinkBox";
import { NewLinkContent } from "@/components/app/NewLinkContent";
import { NewLinkTypes } from "@/components/app/NewLinkTypes";
// Hooks
import { usePuklaStore } from "@/hooks/use-pukla-store";
import useUserStore from "@/hooks/use-user-store";
// Types
import { LinkItemProps } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { CurrentPuklaInfo } from "@/components/app/CurrentPuklaInfo";
import {
  deletePuklaItem,
  fetchPuklaItems,
  fetchPukla,
  updateItemPositions,
  fetchPuklasWithLinkCount,
} from "@/lib/operations";
import { GetStaticProps } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { useMainStore } from "@/hooks/main.store";
import NoPuklas from "@/components/app/NoPuklas";
import ActionLock from "@/components/app/ActionLock";
import ActionLayout from "@/components/app/ActionLayout";
import ActionHighlight from "@/components/app/HighlightLink";
import ActionThumbnail from "@/components/app/ActionThumbnail";
import UpgradeDialog from "@/components/app/UpgradeDialog";

export default function Editor() {
  const t = useTranslations();
  const lang = useLocale();
  const router = useRouter();
  const { user } = useUserStore();
  const { puklas, setPuklas, selectedPukla, setSelectedPukla } = useMainStore();
  const { itemAction, setItemAction } = useMainStore((state) => state);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingPuklas, setIsFetchingPuklas] = useState(false);
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);
  const puklaId = (router.query.id || selectedPukla?.id) as string;
  const direction = lang === "ar" ? "rtl" : "ltr";

  const {
    loadingDelete,
    puklaItems,
    setPuklaItems,
    currentAction,
    setIsDragging,
    handleClearAction,
    handleAction,
    handleDelete,
    handleAddHeader,
    handleSortLinks,
    newLinkType,
    setNewLinkType,
    setNewItemBoxExpanded,
    setBoxExpansion,
    isNewItemBoxExpanded,
    toggleExpandItem,
    isLinkLoading,
  } = usePuklaStore((state) => state);

  const [userPermissions, setUserPermissions] = useState({
    allowAnalytics: false,
    allowHighlight: false,
    allowRedirect: false,
    allowDelete: false,
    allowLock: true,
    allowLayout: false,
    allowThumbnail: false,
    ...user,
  });

  // Add a new state for items loading
  const [isItemsLoading, setIsItemsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setIsItemsLoading(true);

    const initializePuklas = async () => {
      if (!user?.id) return;

      try {
        // First, fetch all puklas
        const puklas = await fetchPuklasWithLinkCount(user?.id, {
          toasts: {
            error: t("MyPuklas.error_fetching_puklas"),
            success: t("MyPuklas.success_fetching_puklas"),
          },
        });
        setPuklas(puklas);

        // If we have a puklaId (either from URL or selected), use that
        if (puklaId) {
          const currentPukla = await fetchPukla(puklaId, {
            toasts: {
              error: t("MyPuklas.error_fetching_puklas"),
              success: t("MyPuklas.success_fetching_puklas"),
            },
          });
          if (currentPukla) {
            setSelectedPukla(currentPukla);
            const items = await fetchPuklaItems(puklaId, {
              toasts: {
                error: t("MyPuklas.error_fetching_puklas"),
                success: t("MyPuklas.success_fetching_puklas"),
              },
            });
            setPuklaItems(items);
          }
        } else if (selectedPukla) {
          // If no puklaId but we have a selected pukla, use that
          router.push(`/editor?id=${selectedPukla.id}`);
        } else if (puklas.length > 0) {
          // Last resort: use first pukla
          setSelectedPukla(puklas[0]);
          router.push(`/editor?id=${puklas[0].id}`);
        }
      } catch (error) {
        console.error("Error initializing puklas:", error);
      } finally {
        setIsLoading(false);
        setIsItemsLoading(false);
      }
    };

    initializePuklas();
    handleClearAction();
  }, [user?.id, puklaId, selectedPukla?.id]);

  const onDelete = async (id: string, puklaId: string, item_type?: string) => {
    try {
      // Update loading state in the store
      setPuklaItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, isDeleting: true } : item
        )
      );

      await deletePuklaItem(id, puklaId, {
        toasts: {
          error: t(`Editor.error_deleting_${item_type}`),
          success: t(`Editor.success_deleting_${item_type}`),
        },
      });

      // Remove the item from the store
      setPuklaItems((items) => items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
      // Reset loading state on error
      setPuklaItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, isDeleting: false } : item
        )
      );
    }
  };

  const renderLinkContent = (item: LinkItemProps) => {
    const action = itemAction?.id === item.id ? itemAction.action : null;

    switch (action) {
      case "delete":
        return (
          <ConfirmDeleteLink
            title={item.title}
            item_type={item.item_type}
            onDelete={async () => {
              await onDelete(item.id, puklaId, item.item_type);
              setItemAction(item.id, null);
            }}
            onCancel={() => {
              setItemAction(item.id, null);
            }}
          />
        );
      case "highlight":
        return (
          <ActionHighlight
            onUpgradeNeeded={() => setOpenUpgradeDialog(true)}
            linkId={item.id}
            puklaId={puklaId}
            value={item.item_highlight}
            onChange={(value) => {
              setPuklaItems((items) =>
                items.map((item) =>
                  item.id === item.id
                    ? { ...item, item_highlight: value }
                    : item
                )
              );
            }}
          />
        );

      case "lock":
        return (
          <ActionLock
            onUpgradeNeeded={() => setOpenUpgradeDialog(true)}
            linkId={item.id}
          />
        );

      case "layout":
        return (
          <ActionLayout
            onUpgradeNeeded={() => setOpenUpgradeDialog(true)}
            linkId={item.id}
            puklaId={puklaId}
          />
        );

      case "thumbnail":
        return (
          <ActionThumbnail
            onUpgradeNeeded={() => setOpenUpgradeDialog(true)}
            linkId={item.id}
            currentThumbnailType={item.item_thumbnail?.thumbnail_type}
            currentThumbnailIcon={item.item_thumbnail?.thumbnail_icon}
            currentThumbnailImage={item.item_thumbnail?.thumbnail_image}
          />
        );

      default:
        return null;
    }
  };

  const handleSort = async (newItems: LinkItemProps[]) => {
    // Update local state immediately for better UX
    setPuklaItems(newItems);

    // Prepare position updates
    const updates = newItems.map((item, index) => ({
      id: item.id,
      position: index,
    }));

    try {
      await updateItemPositions(puklaId, updates, {
        toasts: {
          success: t("Editor.order-updated-successfully"),
          error: t("Editor.failed-to-update-order"),
        },
      });
    } catch (error) {
      // Revert to previous order if update fails
      const { data } = await supabase
        .from("pukla_links")
        .select("*")
        .eq("pukla_id", puklaId)
        .order("position", { ascending: true });

      if (data) {
        setPuklaItems(data);
      }
    }
  };

  if (!puklaId) {
    return (
      <div className="flex flex-col w-full items-center justify-center ">
        {isFetchingPuklas ? (
          <Skeleton className="w-full h-[100px]" />
        ) : puklas.length > 0 ? (
          <Card className="flex flex-col items-center justify-center w-full">
            <CardContent headless className="w-full">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
                <span className="text-2xl font-bold">
                  {t("Editor.select_pukla_to_start_editing")}
                </span>
                <Select
                  onValueChange={(value) => router.push(`/editor?id=${value}`)}
                >
                  <SelectTrigger className="w-full max-w-[200px]">
                    <SelectValue placeholder={t("Editor.select_pukla")} />
                  </SelectTrigger>
                  <SelectContent>
                    {puklas.map((pukla) => (
                      <SelectItem key={pukla.id} value={pukla.id}>
                        {pukla.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ) : (
          <NoPuklas onCreate={() => router.push("/dashboard")} />
        )}
      </div>
    );
  }

  return (
    <main
      className={`flex flex-col items-center justify-between gap-4`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <CustomPageMeta
        title={t("SEO.editor", {
          puklaName: `@${selectedPukla?.title || ""}`,
        })}
      />

      <CurrentPuklaInfo
        pukla={selectedPukla}
        allPuklas={puklas}
        loading={isLoading}
      />
      <div className="flex w-full flex-col gap-10">
        <NewLinkBox
          onAddHeader={() => {
            if (!isNewItemBoxExpanded) {
              setBoxExpansion(true);
              setNewLinkType("header");
            } else {
              if (newLinkType === "header") {
                setBoxExpansion(false);
              } else {
                setNewLinkType("header");
              }
            }
          }}
          onAddButton={() => {
            if (!isNewItemBoxExpanded) {
              setBoxExpansion(true);
              setNewLinkType("undecided");
            } else {
              if (newLinkType === "header") {
                setNewLinkType("undecided");
              } else {
                setBoxExpansion(false);
              }
            }
          }}
        >
          {newLinkType === "undecided" ? (
            <NewLinkTypes onTypeSelected={(e) => setNewLinkType(e)} />
          ) : (
            <NewLinkContent
              puklaId={puklaId}
              onBack={() => setNewLinkType("undecided")}
              newLinkType={newLinkType}
              title={t(`Editor.link_types.${newLinkType}`)}
            />
          )}
        </NewLinkBox>
      </div>

      {/* <Layout> */}
      {/* <ContentLayout> */}
      <div className="pb-20 w-full">
        {isItemsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[68px] w-full rounded-lg" />
            <Skeleton className="h-[68px] w-full rounded-lg" />
            <Skeleton className="h-[68px] w-full rounded-lg" />
          </div>
        ) : puklaItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p>{t("Editor.no_items_found")}</p>
          </div>
        ) : (
          <SortableList
            items={puklaItems}
            isLoading={false}
            setIsDragging={setIsDragging}
            onChange={handleSort}
            renderItem={(item) => {
              const itemProps = {
                id: item.id,
                url: item.url,
                title: item.title,
                is_draft: item.is_draft,
                is_editing: item.is_editing,
                is_enabled: item.is_enabled,
                is_favorite: item.is_favorite,
                is_expanded: item.is_expanded,
              };
              if (item.item_type === "header") {
                return (
                  <div className="relative">
                    <SingleHeader
                      puklaId={puklaId}
                      isDeleting={item.isDeleting}
                      {...itemProps}
                    >
                      {itemAction?.id === item.id &&
                        itemAction?.action === "delete" && (
                          <ConfirmDeleteLink
                            title={item.title}
                            item_type="header"
                            onDelete={() =>
                              handleDelete(item.id, puklaId, "header")
                            }
                            onCancel={() => setItemAction(item.id, null)}
                          />
                        )}
                    </SingleHeader>
                    {
                      <LoadingOverlay
                        dir={direction}
                        isLoading={loadingDelete === item.id}
                      />
                    }
                  </div>
                );
              } else if (item.item_type === "link") {
                return (
                  <div className="relative">
                    <SingleLink
                      puklaId={puklaId}
                      isDeleting={item.isDeleting}
                      isLoading={loadingDelete === item.id}
                      {...itemProps}
                    >
                      {renderLinkContent(item)}
                    </SingleLink>
                    {
                      <LoadingOverlay
                        dir={direction}
                        isLoading={
                          loadingDelete === item.id || isLinkLoading === item.id
                        }
                      />
                    }
                  </div>
                );
              }
            }}
          />
        )}
      </div>
      <UpgradeDialog
        open={openUpgradeDialog}
        onOpenChange={setOpenUpgradeDialog}
        onUpgrade={() => router.push("/billing")}
      />
    </main>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
