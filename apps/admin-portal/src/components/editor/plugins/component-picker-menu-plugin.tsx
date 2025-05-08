"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useBasicTypeaheadTriggerMatch } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { TextNode } from "lexical";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState, JSX, RefObject } from "react";
import * as React from "react";

import { useEditorModal } from "@/components/editor/editor-hooks/use-modal";
import { ComponentPickerOption } from "@/components/editor/plugins/picker/component-picker-option";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from "../../ui/popover";

const LexicalTypeaheadMenuPlugin = dynamic(
  () => import("./default/lexical-typeahead-menu-plugin"),
  { ssr: false },
);

export function ComponentPickerMenuPlugin({
  baseOptions = [],
  dynamicOptionsFn,
}: {
  baseOptions?: Array<ComponentPickerOption>;
  dynamicOptionsFn?: ({ queryString }: { queryString: string }) => Array<ComponentPickerOption>;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useEditorModal();
  const [queryString, setQueryString] = useState<string | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(() => {
    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");

    return [
      ...(dynamicOptionsFn?.({ queryString }) || []),
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) || option.keywords.some((keyword) => regex.test(keyword)),
      ),
    ];
  }, [editor, queryString, showModal, baseOptions, dynamicOptionsFn]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString, editor, showModal);
        closeMenu();
      });
    },
    [editor],
  );

  return (
    <>
      {modal}
      <LexicalTypeaheadMenuPlugin
        onQueryChange={setQueryString}
        // @ts-ignore
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        // @ts-ignore
        menuRenderFn={(
          anchorElementRef: RefObject<HTMLElement | null | undefined>,
          itemProps: {
            selectedIndex: number | null;
            selectOptionAndCleanUp: (option: ComponentPickerOption) => void;
            setHighlightedIndex: (index: number) => void;
            options: Array<ComponentPickerOption>;
          },
          menuContext: { setMenuRef: (ref: HTMLElement | null) => void },
        ) => {
          const { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex } = itemProps;
          const { setMenuRef } = menuContext;

          return anchorElementRef.current && options.length ? (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverPortal container={anchorElementRef.current}>
                <div>
                  <PopoverTrigger
                    ref={setMenuRef}
                    style={{ userSelect: "none", width: "0px", height: "0px" }}
                  />
                  <PopoverContent
                    align="start"
                    sideOffset={0}
                    className="w-[250px] p-0 shadow-md"
                    onOpenAutoFocus={(e) => e.preventDefault()} // User commented this out, keeping it as is
                    onWheel={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setHighlightedIndex(
                          selectedIndex !== null
                            ? (selectedIndex - 1 + options.length) % options.length
                            : options.length - 1,
                        );
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setHighlightedIndex(
                          selectedIndex !== null ? (selectedIndex + 1) % options.length : 0,
                        );
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        if (selectedIndex !== null && options[selectedIndex]) {
                          selectOptionAndCleanUp(options[selectedIndex]);
                          setIsOpen(false);
                        }
                      }
                    }}
                  >
                    <Command
                      value={
                        selectedIndex !== null && options[selectedIndex]
                          ? options[selectedIndex].key
                          : undefined
                      }
                    >
                      <CommandList>
                        <CommandGroup>
                          {options.map((option, index) => (
                            <CommandItem
                              key={option.key}
                              value={option.key}
                              className="flex items-center gap-2"
                              onSelect={() => {
                                selectOptionAndCleanUp(option);
                                setIsOpen(false);
                              }}
                            >
                              {option.icon}
                              {option.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </div>
              </PopoverPortal>
            </Popover>
          ) : null;
        }}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
