import React, { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import * as Collapsible from "@radix-ui/react-collapsible";
import clsx from "clsx";
// UI
import { Button } from "@/components/ui/button";
// Hooks
import { usePuklaStore } from "@/hooks/use-pukla-store";

type NewLinkBoxType = {
  children: React.ReactNode;
  onAddHeader?: () => void;
  onAddButton?: () => void;
};

export const NewLinkBox: React.FC<NewLinkBoxType> = (props) => {
  const t = useTranslations();
  const lang = useLocale();

  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<any>(null);
  const { isNewItemBoxExpanded, setNewItemBoxExpanded } = usePuklaStore(
    (state) => state
  );
  const updateHeight = () => {
    if (contentRef.current) {
      if (isNewItemBoxExpanded) {
        setContentHeight(contentRef.current.scrollHeight);
      } else {
        setContentHeight(0);
      }
    }
  };

  useEffect(() => {
    updateHeight();
  }, [props.children, updateHeight]);

  useEffect(() => {
    updateHeight();
  }, [isNewItemBoxExpanded, updateHeight]);

  return (
    <div className="rounded border drop-shadow-sm">
      <Collapsible.Root
        className={clsx("bg-singleLinkContentBG w-full rounded transition-all")}
        dir={lang === "ar" ? "rtl" : "ltr"}
        onOpenChange={setNewItemBoxExpanded}
        open={isNewItemBoxExpanded}
      >
        <div
          className={clsx(
            "bg-singleLinkHeaderBG flex w-full flex-row items-center justify-between gap-2 rounded p-4  transition-all",
            isNewItemBoxExpanded ? "rounded-b-none" : "rounded-b"
          )}
        >
          <div
            className="tems-center flex w-full flex-col justify-center gap-2 sm:flex-row"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <Button size={"lg"} className="w-full" onClick={props.onAddButton}>
              {t("Editor.add-button")}
            </Button>
            <Button
              size={"lg"}
              className="whitespace-nowrap"
              onClick={props.onAddHeader}
            >
              {t("Editor.add-header")}
            </Button>
          </div>
        </div>
        <Collapsible.Content
          forceMount
          style={{
            overflow: "hidden",
            height: `${contentHeight}px`,
            transition: "height 300ms ease-in-out",
          }}
          className="[data-state=closed]:opacity-0 [data-state=open]:opacity-100"
        >
          <div className={"p4"} ref={contentRef}>
            {props.children}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
};
