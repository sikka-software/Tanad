import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormItem, FormLabel } from "../ui/form";

// Hooks
import { usePuklaStore } from "@/hooks/use-pukla-store";
import { useLocale, useTranslations } from "next-intl";

type NewHeaderType = { puklaId?: string };

export const NewHeader: React.FC<NewHeaderType> = ({ puklaId }) => {
  const t = useTranslations();
  const lang = useLocale();

  const {
    setPuklaItems,
    loadingCreate,
    setLoadingCreate,
    setNewLinkType,
    setNewItemBoxExpanded,
  } = usePuklaStore();

  const form = useForm({
    defaultValues: { title: "" },
  });

  const submitHandler = async (e: any) => {
    setLoadingCreate(true);

    try {
      // First, shift all existing items' positions up by 1
      await supabase.rpc("shift_positions_up", {
        p_pukla_id: puklaId,
      });

      // Insert the new header at position 0
      const { data, error } = await supabase
        .from("pukla_links")
        .insert({
          pukla_id: puklaId,
          title: e.title,
          position: 0, // Set to 0 to make it first
          is_draft: false,
          is_enabled: true,
          is_favorite: false,
          is_expanded: false,
          item_type: "header",
        })
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setPuklaItems((currentItems) => [data[0], ...currentItems]);
        form.reset();
        toast.success(t("Editor.header-added-successfully"));
        setNewItemBoxExpanded();
        setNewLinkType("undecided");
      }
    } catch (error) {
      console.error("Error creating header:", error);
      toast.error(t("Editor.failed-to-add-header"));
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
          <Controller
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Editor.header-title.label")}</FormLabel>
                <FormControl>
                  <>
                    <Input
                      {...field}
                      maxLength={40}
                      placeholder={t("Editor.header-title.placeholder")}
                    />
                    {/* Characters count */}
                    <p className="text-sm text-muted-foreground">
                      {field.value.length} / 40
                    </p>
                  </>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button
            type="submit"
            className="w-full max-w-40"
            disabled={loadingCreate}
          >
            {loadingCreate ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("Editor.add-new-header")
            )}
          </Button>
          <Button
            onClick={() => {
              setNewItemBoxExpanded();
              setNewLinkType("undecided");
            }}
            type="button"
            variant="outline"
          >
            {t("General.cancel")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
