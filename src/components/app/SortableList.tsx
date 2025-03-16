"use client";

import React, { useState } from "react";
import type { ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { Active, UniqueIdentifier } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
// Components
import { DragHandle, SortableItem } from "@/components/app/SortableItem";
// Utils
import { cn } from "@/lib/utils";
import { verticalSortableListCollisionDetection } from "@/lib/sort-utils";

interface BaseItem {
  id: UniqueIdentifier;
  createdAt: string;
}

interface Props<T extends BaseItem> {
  items: T[];
  onChange(items: T[]): void;
  renderItem(item: T): ReactNode;
  setIsDragging?(isDragging: boolean): void;
  className?: string;
  inCard?: boolean;
  isLoading?: boolean;
}

export function SortableList<T extends BaseItem>({
  items,
  onChange,
  renderItem,
  setIsDragging,
  inCard,
  isLoading,
  ...props
}: Props<T | any>) {
  const [active, setActive] = useState<Active | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(MouseSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      collisionDetection={verticalSortableListCollisionDetection}
      sensors={sensors}
      onDragStart={({ active }) => {
        setActive(active);
        setIsDragging?.(true);
      }}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over?.id) {
          const activeIndex = items.findIndex(({ id }) => id === active.id);
          const overIndex = items.findIndex(({ id }) => id === over.id);

          onChange(arrayMove(items, activeIndex, overIndex));
        }
        setActive(null);
        setIsDragging?.(false);
      }}
      onDragCancel={() => {
        setActive(null);
        setIsDragging?.(false);
      }}
    >
      <SortableContext strategy={verticalListSortingStrategy} items={items}>
        <ul
          className={cn(
            "SortableList flex h-full flex-col gap-4",
            props.className
          )}
          style={{
            touchAction: "none",
          }}
          role="application"
        >
          {items?.map((item) => (
            <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

SortableList.Item = SortableItem;
SortableList.DragHandle = DragHandle;
