import { Flag } from "lucide-react";

import { TooltipContent, Tooltip, TooltipTrigger } from "./tooltip";

const BetaFlag = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger className="w-full">{children}</TooltipTrigger>
      <TooltipContent className="max-w-[250px]">
        <div className="flex flex-row py-2">
          <div className="flex flex-col">
            <span className="flex flex-row items-center text-sm font-bold">
              <Flag className="me-2 !size-3" />
              {title}
            </span>
            <p className="text-xs">{description}</p>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default BetaFlag;
