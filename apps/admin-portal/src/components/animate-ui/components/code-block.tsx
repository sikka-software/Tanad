"use client";

import { useTheme } from "next-themes";
import * as React from "react";

import { CopyButton } from "@/components/animate-ui/buttons/copy";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsContents,
  type TabsProps,
} from "@/components/animate-ui/components/tabs";

import { cn } from "@/lib/utils";

type CodeBlockProps = {
  code: string;
  lang?: string;
  themes?: {
    light: string;
    dark: string;
  };
  copyButton?: boolean;
  onCopy?: (content: string) => void;
} & Omit<React.ComponentProps<"div">, "children">;

function CodeBlock({
  code,
  lang = "bash",
  themes = {
    light: "github-light",
    dark: "github-dark",
  },
  className,
  defaultValue,
  copyButton = true,
  onCopy,
  ...props
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme();

  const [highlightedCode, setHighlightedCode] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadHighlightedCode() {
      try {
        const { codeToHtml } = await import("shiki");
        const newHighlightedCode: string = "";

        const highlighted = await codeToHtml(code, {
          lang,
          themes: {
            light: themes.light,
            dark: themes.dark,
          },
          defaultColor: resolvedTheme === "dark" ? "dark" : "light",
        });

        setHighlightedCode(highlighted);
      } catch (error) {
        setHighlightedCode(code);
      }
    }
    loadHighlightedCode();
  }, [resolvedTheme, lang, themes.light, themes.dark, code]);

  return (
    <Tabs
      data-slot="install-tabs"
      className={cn("bg-muted/50 w-full gap-0 overflow-hidden rounded-xl border", className)}
      {...props}
    >
      <TabsList
        data-slot="install-tabs-list"
        className="bg-muted border-border/75 dark:border-border/50 relative h-10 w-full justify-between rounded-none border-b px-4 py-0 text-current"
        activeClassName="rounded-none shadow-none bg-transparent after:content-[''] after:absolute after:inset-x-0 after:h-0.5 after:bottom-0 dark:after:bg-white after:bg-black after:rounded-t-full"
      >
        <div className="flex h-full gap-x-3">
          {highlightedCode &&
            Object.keys(highlightedCode).map((code) => (
              <TabsTrigger
                key={code}
                value={code}
                className="text-muted-foreground px-0 data-[state=active]:text-current"
              >
                {code}
              </TabsTrigger>
            ))}
        </div>

        {copyButton && highlightedCode && (
          <CopyButton
            content={highlightedCode}
            size="sm"
            variant="ghost"
            className="-me-2 bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
            onCopy={onCopy}
          />
        )}
      </TabsList>
      <TabsContents data-slot="install-tabs-contents">
        {highlightedCode && (
          <TabsContent
            data-slot="install-tabs-content"
            key={code}
            className="flex w-full items-center overflow-auto p-4 text-sm"
            value={code}
          >
            <div
              className="[&_code]:!text-[13px] [&>pre,_&_code]:border-none [&>pre,_&_code]:!bg-transparent [&>pre,_&_code]:[background:transparent_!important]"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </TabsContent>
        )}
      </TabsContents>
    </Tabs>
  );
}

export { CodeBlock, type CodeBlockProps };
