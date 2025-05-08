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
import { cn } from "@root/src/lib/utils";
import { TextNode } from "lexical";
import dynamic from "next/dynamic";
import React, { useCallback, useMemo, useState, JSX, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

import { useEditorModal } from "@/components/editor/editor-hooks/use-modal";
import { ComponentPickerOption } from "@/components/editor/plugins/picker/component-picker-option";

// Removed Popover imports as we are creating a custom popover-like structure
// import { Popover, PopoverContent } from "@/components/ui/popover";

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
  }, [baseOptions, dynamicOptionsFn, queryString]);

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
    [editor, showModal],
  );

  return (
    <>
      {modal}
      {/* @ts-ignore */}
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
        ) => {
          const listRef = useRef<HTMLDivElement>(null);

          useEffect(() => {
            if (listRef.current) {
              listRef.current.focus({ preventScroll: true });
            }
          }, []);

          useEffect(() => {
            if (listRef.current && selectedIndex !== null) {
              const selectedButton = listRef.current.querySelector(
                `button[data-index="${selectedIndex}"]`,
              ) as HTMLElement;
              if (selectedButton) {
                selectedButton.scrollIntoView({ block: "nearest" });
              }
            }
          }, [selectedIndex]);

          return anchorElementRef.current && options.length
            ? createPortal(
                // This div is the main popover container, positioned by anchorElementRef.current (its parent in the portal)
                <div
                  className="bg-popover text-popover-foreground absolute z-[200] w-[250px] rounded-md border p-1 shadow-md"
                  // style={{ top: 0, left: 0 }} // To align with anchor if anchor is just a point.
                  // Or rely on anchorElementRef having dimensions and this flowing into it.
                >
                  <div // This div is the scrollable list container
                    ref={listRef}
                    tabIndex={-1} // Make it programmatically focusable
                    role="listbox"
                    onKeyDown={(e) => {
                      if (options.length === 0) return;
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
                      } else if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (selectedIndex !== null && options[selectedIndex]) {
                          selectOptionAndCleanUp(options[selectedIndex]);
                        }
                      }
                    }}
                    className="max-h-[240px] w-full overflow-y-auto outline-none focus:outline-none"
                  >
                    {options.map((option, index) => (
                      <button
                        key={option.key}
                        role="option"
                        aria-selected={selectedIndex === index}
                        data-index={index} // For querySelector in scrollIntoView effect
                        onMouseDown={(e) => {
                          // Use onMouseDown to highlight before click potentially steals focus
                          e.preventDefault(); // Prevent blur on editor
                          setHighlightedIndex(index);
                        }}
                        onClick={() => {
                          selectOptionAndCleanUp(option);
                        }}
                        onMouseEnter={() => {
                          setHighlightedIndex(index);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none",
                          "hover:bg-accent hover:text-accent-foreground", // Standard hover
                          selectedIndex === index
                            ? "bg-accent text-accent-foreground" // Selected item
                            : "text-popover-foreground bg-transparent", // Default item state
                          "focus-visible:bg-accent focus-visible:text-accent-foreground", // Keyboard focus
                        )}
                      >
                        {option.icon}
                        {option.title}
                      </button>
                    ))}
                  </div>
                </div>,
                anchorElementRef.current,
              )
            : null;
        }}
      />
    </>
  );
}
