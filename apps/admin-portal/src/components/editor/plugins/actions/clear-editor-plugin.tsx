import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_EDITOR_COMMAND } from "lexical";
import { Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ClearEditorActionPlugin() {
  const t = useTranslations();
  const [editor] = useLexicalComposerContext();

  return (
    <Dialog>
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size={"sm"} variant={"ghost"} className="p-2">
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>{t("General.clear")}</TooltipContent>
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("General.clear")}</DialogTitle>
          <DialogDescription>{t("General.clear_editor_description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("General.cancel")}</Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() => {
                editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
              }}
            >
              {t("General.clear")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
