"use client";

import React, { createContext, useContext, useMemo } from "react";
import { CSSProperties, PropsWithChildren } from "react";
import { DraggableSyntheticListeners, UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
// UI
import { Button } from "@/components/ui/button";
// Hooks
import { useBreakpoint } from "@/hooks/use-breakpoint";
// Utils
import { cn } from "@/lib/utils";

interface Props {
  id: UniqueIdentifier;
  className?: string;
}

interface Context {
  attributes: Record<string, any>;
  listeners: DraggableSyntheticListeners;
  ref(node: HTMLElement | null): void;
}

const SortableItemContext = createContext<Context>({
  attributes: {},
  listeners: undefined,
  ref() {},
});

export function SortableItem({
  children,
  id,
  ...props
}: PropsWithChildren<Props>) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  const context = useMemo(
    () => ({
      attributes,
      listeners,
      ref: setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef]
  );

  const size = useBreakpoint();

  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
    width: "100%",
    // width: size > 800 ? "100%" : "calc(100% - 32px)"
    // width: lang === 'ar' || size > 800 ? "100%" : "calc(100% - 32px)"
  };

  return (
    <SortableItemContext.Provider value={context}>
      <div
        ref={setNodeRef}
        style={style}
        className={cn("flex w-full flex-row gap-2", props.className)}
      >
        {/* <div>
          <DragHandle style={{ cursor: isDragging ? "grabbing" : "grab" }} />
        </div> */}
        {children}
      </div>
    </SortableItemContext.Provider>
  );
}

export function DragHandle(props: any) {
  const { attributes, listeners, ref } = useContext(SortableItemContext);
  return (
    <div
      {...attributes}
      {...listeners}
      ref={ref}
      className="flex items-center justify-center"
    >
      <Button
        // size={"icon"}
        variant={"ghost"}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="h-[100%] w-[10px] rounded-e-none border-e"
        style={{ ...props.style }}
      >
        <GripVertical className="h-6 w-6" />
      </Button>
    </div>
  );
}
