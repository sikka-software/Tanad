import React from "react";
// UI
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SingleLinkActionButtonProps = {
  icon?: React.ReactNode;
  handleClick?: (e: any) => void;
  tooltipSide?: "top" | "bottom" | "left" | "right";
  tooltip?: React.ReactNode;
  tooltipClassName?: string;
  disabled?: boolean;
};
export const SingleLinkActionButton = (props: SingleLinkActionButtonProps) => (
  <TooltipProvider>
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <div>
          <Button
            disabled={props.disabled}
            size={"icon_sm"}
            variant={"outline"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              props.handleClick?.(e);
            }}
          >
            {props.icon}
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side={props.tooltipSide}
        className={props.tooltipClassName}
      >
        {props.tooltip}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
