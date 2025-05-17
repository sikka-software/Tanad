import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { MenuOption } from "@lexical/react/LexicalContextMenuPlugin";
import { PopoverPortal } from "@radix-ui/react-popover";
import {
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isRangeSelection,
  COPY_COMMAND,
  CUT_COMMAND,
  type LexicalNode,
  PASTE_COMMAND,
} from "lexical";
import {
  Clipboard,
  ClipboardPaste,
  CopyIcon,
  LucideProps,
  Scissors,
  Trash2Icon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useCallback, useMemo, JSX, RefAttributes } from "react";
import * as React from "react";
import { toast } from "sonner";

import { Command, CommandItem, CommandList } from "@/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

import { ScrollArea } from "../../ui/scroll-area";

const LexicalContextMenuPlugin = dynamic(() => import("./default/lexical-context-menu-plugin"), {
  ssr: false,
});

export class ContextMenuOption extends MenuOption {
  title: string;
  onSelect: (targetNode: LexicalNode | null) => void;
  icon?: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  constructor(
    title: string,
    options: {
      onSelect: (targetNode: LexicalNode | null) => void;
      icon?: React.ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
      >;
    },
  ) {
    super(title);
    this.title = title;
    this.onSelect = options.onSelect.bind(this);
    this.icon = options.icon;
  }
}

export function ContextMenuPlugin(): JSX.Element {
  const t = useTranslations();
  const lang = useLocale();
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = React.useState(false);

  const defaultOptions = useMemo(() => {
    return [
      new ContextMenuOption(t("General.copy"), {
        onSelect: (_node) => {
          editor.dispatchCommand(COPY_COMMAND, null);
        },
        icon: Clipboard,
      }),

      new ContextMenuOption(t("General.cut"), {
        onSelect: (_node) => {
          editor.dispatchCommand(CUT_COMMAND, null);
        },
        icon: Scissors,
      }),
      new ContextMenuOption(t("General.paste"), {
        onSelect: (_node) => {
          navigator.clipboard.read().then(async function (...args) {
            const data = new DataTransfer();

            const items = await navigator.clipboard.read();
            const item = items[0];

            const permission = await navigator.permissions.query({
              // @ts-expect-error These types are incorrect.
              name: "clipboard-read",
            });
            if (permission.state === "denied") {
              toast.warning("Not allowed to paste from clipboard.");
              return;
            }

            for (const type of item.types) {
              const dataString = await (await item.getType(type)).text();
              data.setData(type, dataString);
            }

            const event = new ClipboardEvent("paste", {
              clipboardData: data,
            });

            editor.dispatchCommand(PASTE_COMMAND, event);
          });
        },
        icon: ClipboardPaste,
      }),
      // new ContextMenuOption(`Paste as Plain Text`, {
      //   onSelect: (_node) => {
      //     navigator.clipboard.read().then(async function (...args) {
      //       const permission = await navigator.permissions.query({
      //         // @ts-expect-error These types are incorrect.
      //         name: "clipboard-read",
      //       });

      //       if (permission.state === "denied") {
      //         toast.warning("Not allowed to paste from clipboard.");
      //         return;
      //       }

      //       const data = new DataTransfer();
      //       const items = await navigator.clipboard.readText();
      //       data.setData("text/plain", items);

      //       const event = new ClipboardEvent("paste", {
      //         clipboardData: data,
      //       });
      //       editor.dispatchCommand(PASTE_COMMAND, event);
      //     });
      //   },
      // }),
      new ContextMenuOption(t("General.delete"), {
        onSelect: (_node) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const currentNode = selection.anchor.getNode();
            const ancestorNodeWithRootAsParent = currentNode.getParents().at(-2);

            ancestorNodeWithRootAsParent?.remove();
          }
        },
        icon: Trash2Icon,
      }),
    ];
  }, [editor]);

  const [options, setOptions] = React.useState(defaultOptions);

  const onSelectOption = useCallback(
    (selectedOption: ContextMenuOption, targetNode: LexicalNode | null, closeMenu: () => void) => {
      editor.update(() => {
        selectedOption.onSelect(targetNode);
        closeMenu();
      });
    },
    [editor],
  );

  const onWillOpen = (event: MouseEvent) => {
    let newOptions = defaultOptions;
    setIsOpen(true);
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(event.target as Element);
      if (node) {
        const parent = node.getParent();
        if ($isLinkNode(parent)) {
          newOptions = [
            new ContextMenuOption(`Remove Link`, {
              onSelect: (_node) => {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
              },
            }),
            ...defaultOptions,
          ];
        }
      }
    });
    setOptions(newOptions);
  };

  return (
    <LexicalContextMenuPlugin
      options={options}
      onSelectOption={(option, targetNode) => {
        onSelectOption(option as ContextMenuOption, targetNode, () => {
          setIsOpen(false);
        });
      }}
      onWillOpen={onWillOpen}
      onOpen={() => {
        setIsOpen(true);
      }}
      onClose={() => {
        setIsOpen(false);
      }}
      menuRenderFn={(
        anchorElementRef,
        { options: _options, selectOptionAndCleanUp },
        { setMenuRef },
      ) => {
        return anchorElementRef.current ? (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverPortal container={anchorElementRef.current}>
              <div>
                <PopoverTrigger
                  ref={setMenuRef}
                  style={{
                    marginLeft: anchorElementRef.current?.style.width,
                    userSelect: "none",
                  }}
                />
                <PopoverContent
                  dir={lang === "ar" ? "rtl" : "ltr"}
                  className="w-[100px] p-1"
                  onWheel={(e) => e.stopPropagation()}
                >
                  <Command>
                    <CommandList>
                      {options.map((option) => (
                        <CommandItem
                          key={option.key}
                          onSelect={() => {
                            selectOptionAndCleanUp(option);
                          }}
                        >
                          {option.icon && <option.icon />}
                          {option.title}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </div>
            </PopoverPortal>
          </Popover>
        ) : null;
      }}
    />
  );
}
