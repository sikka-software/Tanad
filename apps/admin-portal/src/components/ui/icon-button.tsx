import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface IconButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string | React.ReactNode;
  badge?: number;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonType?: "button" | "submit" | "reset";
  size?: "icon" | "default" | "sm" | "lg" | "icon_sm";
  contentClassName?: string;
  disabled?: boolean;
}

const IconButton = ({
  icon,
  label,
  badge,
  buttonType,
  variant,
  size,
  contentClassName,
  disabled,
  ...props
}: IconButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          <Button
            variant={variant || "outline"}
            size={size || "icon"}
            className={cn("relative size-8", props.className)}
            type={buttonType || "button"}
            disabled={disabled}
            {...props}
          >
            {icon}
            {badge !== undefined && (
              <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px]">
                {badge}
              </span>
            )}
            <span className="sr-only">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent
          style={{
            transformOrigin: "var(--radix-tooltip-trigger-width)",
          }}
          className={contentClassName}
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default IconButton;
