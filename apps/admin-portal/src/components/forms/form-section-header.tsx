import { PlusCircle } from "lucide-react";

import { Button } from "../ui/button";

const FormSectionHeader = ({
  title,
  subtitle,
  onCreate,
  onCreateText,
  onCreateDisabled,
}: {
  title: string;
  subtitle?: string;
  onCreate?: () => void;
  onCreateText?: string;
  onCreateDisabled?: boolean;
}) => {
  return (
    <div className="sticky top-12 z-10 flex !min-h-12 w-full flex-col items-center justify-between">
      <div className="bg-muted sticky top-12 z-10 flex !min-h-12 w-full items-center justify-between gap-4 border-y px-2">
        <div className="flex flex-col">
          <h2 className="ms-2 text-xl font-bold">{title}</h2>
        </div>
        {onCreate && (
          <Button type="button" size="sm" onClick={onCreate} disabled={onCreateDisabled}>
            <PlusCircle className="mr-2 size-4" />
            {onCreateText}
          </Button>
        )}
      </div>
      {subtitle && <h4 className="bg-background border-b w-full p-2 ps-4 text-start text-xs">{subtitle}</h4>}
    </div>
  );
};

export default FormSectionHeader;
