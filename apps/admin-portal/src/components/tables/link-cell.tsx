import { ExternalLink, SquareArrowOutUpRight } from "lucide-react";
import { ChangeEvent } from "react";

import IconButton from "@/ui/icon-button";
import { Input } from "@/ui/inputs/input";

import { cn } from "@/lib/utils";

const CodeCell = ({
  value,
  onChange,
  onBlur,
  onClick,
}: {
  value: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick: () => void;
}) => {
  const cellValue = value;
  return (
    <div className="group relative">
      <Input
        className="!bg-transparent"
        inCell
        defaultValue={cellValue}
        // value={cellValue || ""}
        style={{ minHeight: 36 }}
        // onChange={onChange}
        onBlur={onBlur}
      />
      <IconButton
        size="icon_sm"
        variant="ghost"
        className={cn(
          "opacity-0 transition-opacity group-hover:opacity-100",
          "absolute end-0.5 top-1 cursor-pointer",
        )}
        onClick={onClick}
        icon={<SquareArrowOutUpRight className="size-4" />}
      />
    </div>
  );
};

export default CodeCell;
