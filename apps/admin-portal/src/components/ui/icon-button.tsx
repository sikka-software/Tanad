import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface IconButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
}

const IconButton = ({ icon, label, ...props }: IconButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="outline" size="icon" className={cn("size-8", props.className)} {...props}>
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};

export default IconButton;
