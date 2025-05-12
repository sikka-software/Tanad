"use client";

import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type DropdownMenuCheckboxItemConfig = {
  label: string;
  checked: DropdownMenuCheckboxItemProps["checked"];
  onCheckedChange: (checked: DropdownMenuCheckboxItemProps["checked"]) => void;
  disabled?: boolean;
};

export type DropdownMenuCheckboxProps = {
  items: DropdownMenuCheckboxItemConfig[];
  menuLabel?: string;
  children?: React.ReactNode;
  contentClassName?: string;
  dir?: "ltr" | "rtl";
};

export function DropdownMenuCheckbox({
  items,
  menuLabel = "Options",
  children,
  contentClassName = "w-56",
  dir = "rtl",
}: DropdownMenuCheckboxProps) {
  return (
    <DropdownMenu dir={dir}>
      <DropdownMenuTrigger asChild>
        {children || <Button variant="outline">Open</Button>}
      </DropdownMenuTrigger>
      <DropdownMenuContent className={contentClassName}>
        <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item, idx) => (
          <DropdownMenuCheckboxItem
            key={item.label + idx}
            checked={item.checked}
            onCheckedChange={item.onCheckedChange}
            disabled={item.disabled}
          >
            {item.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
