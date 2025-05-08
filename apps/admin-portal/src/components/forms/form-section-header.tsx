import { cn } from "@root/src/lib/utils";
import { PlusCircle } from "lucide-react";
import { FieldError } from "react-hook-form";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const FormSectionHeader = ({
  title,
  subtitle,
  onCreate,
  onCreateText,
  onCreateDisabled,
  onError,
  isError,
  onErrorText,
  inDialog,
}: {
  title: string;
  subtitle?: string;
  onCreate?: () => void;
  onCreateText?: string;
  onCreateDisabled?: boolean;
  onError?: any;
  isError?: FieldError | boolean;
  onErrorText?: string;
  inDialog?: boolean;
}) => {
  return (
    <div
      className={cn(
        inDialog ? "top-0" : "top-12",
        "sticky z-10 flex !min-h-12 w-full flex-col items-center justify-between",
      )}
    >
      <div className="bg-muted sticky top-12 z-10 flex !min-h-12 w-full items-center justify-between gap-4 border-y px-2">
        <div className="flex flex-col">
          <div className="flex flex-row items-center gap-2">
            <h2 className="ms-2 text-xl font-bold">{title}</h2>
            {isError && <Badge variant={"destructive"}>{onErrorText}</Badge>}
          </div>
        </div>
        {onCreate && (
          <Button type="button" size="sm" onClick={onCreate} disabled={onCreateDisabled}>
            <PlusCircle className="me-2 size-4" />
            {onCreateText}
          </Button>
        )}
      </div>
      {subtitle && (
        <h4 className="bg-background w-full border-b p-2 ps-4 text-start text-xs">{subtitle}</h4>
      )}
    </div>
  );
};

export default FormSectionHeader;
