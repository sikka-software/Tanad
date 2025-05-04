import { PlusCircle } from "lucide-react";

import { Button } from "../ui/button";

const FormSectionHeader = ({
  title,
  onCreate,
  onCreateText,
  onCreateDisabled,
}: {
  title: string;
  onCreate?: () => void;
  onCreateText?: string;
  onCreateDisabled?: boolean;
}) => {
  return (
    <div className="bg-muted sticky top-12 z-10 flex !min-h-12 items-center justify-between gap-4 border-y border-b px-2">
      <h2 className="ms-2 text-xl font-bold">{title}</h2>
      {onCreate && (
        <Button type="button" size="sm" onClick={onCreate} disabled={onCreateDisabled}>
          <PlusCircle className="mr-2 size-4" />
          {onCreateText}
        </Button>
      )}
    </div>
  );
};

export default FormSectionHeader;
