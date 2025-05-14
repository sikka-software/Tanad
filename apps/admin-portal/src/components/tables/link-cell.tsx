import { ExternalLink } from "lucide-react";
import { ChangeEvent } from "react";

import IconButton from "@/ui/icon-button";
import { Input } from "@/ui/input";

import { cn } from "@/lib/utils";

const CodeCell = ({
  value,
  onChange,
  onClick,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick: () => void;
}) => {
  const cellValue = value;
  return (
    <div className="group relative">
      <Input
        className="!bg-transparent"
        inCell
        value={cellValue || ""}
        style={{ minHeight: 36 }}
        onChange={onChange}
      />
      <IconButton
        size="icon_sm"
        variant="ghost"
        className={cn(
          "opacity-0 transition-opacity group-hover:opacity-100",
          "absolute end-0.5 top-1 cursor-pointer",
        )}
        onClick={onClick}
        icon={<ExternalLink className="size-4" />}
      />
    </div>
  );
};

export default CodeCell;
