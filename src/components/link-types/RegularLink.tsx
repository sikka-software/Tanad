import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Hooks
import { usePuklaStore } from "@/hooks/use-pukla-store";
import { supabase } from "@/lib/supabase";
import { fetchPuklaItems } from "@/lib/operations";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
} from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { LinkItemProps } from "@/lib/types";
import { useMainStore } from "@/hooks/main.store";
type RegularLinkType = { puklaId?: any };

export const RegularLink: React.FC<RegularLinkType> = ({ puklaId }) => {
  const t = useTranslations();
  const { setUrlTooLong } = useMainStore();
  const {
    handleEditDone,
    setPuklaItems,
    loadingCreate,
    setLoadingCreate,
    setNewLinkType,
    setNewItemBoxExpanded,
    currentPukla,
  } = usePuklaStore();

  const form = useForm({
    defaultValues: { title: "", url: "" },
  });

  const submitHandler = async (e: any) => {
    setLoadingCreate(true);

    try {
      // First, shift all existing items' positions up by 1
      await supabase.rpc("shift_positions_up", {
        p_pukla_id: puklaId,
      });

      // Insert the new item at position 0
      const { data, error } = await supabase
        .from("pukla_links")
        .insert({
          pukla_id: puklaId,
          title: e.title,
          url: e.url,
          position: 0, // Set to 0 to make it first
          is_draft: false,
          is_enabled: true,
          is_favorite: false,
          is_expanded: false,
          item_type: "link",
        })
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setPuklaItems((currentItems: LinkItemProps[]) => [
          data[0] as LinkItemProps,
          ...currentItems,
        ]);
        form.reset();
        toast.success(t("Editor.link-added-successfully"));
        setNewItemBoxExpanded();
        setNewLinkType("undecided");
      }
    } catch (error) {
      console.error("Error creating link:", error);
      toast.error(t("Editor.failed-to-add-link"));
    } finally {
      setLoadingCreate(false);
    }
  };

  return (
    <Form {...form}>
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(submitHandler)}
      >
        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Editor.link-title.label")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("Editor.link-title.placeholder")}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Editor.link-url.label")}</FormLabel>
                <FormControl>
                  <Input
                    dir="ltr"
                    className="rtl:text-right"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setUrlTooLong(e.target.value.length > 15);
                    }}
                    placeholder={t("Editor.link-url.placeholder")}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button
            type="submit"
            className="w-full md:max-w-40"
            disabled={loadingCreate}
          >
            {loadingCreate ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("Editor.add-new-link")
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full md:max-w-40"
            onClick={() => {
              setNewItemBoxExpanded();
              setNewLinkType("undecided");
            }}
          >
            {t("General.cancel")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
