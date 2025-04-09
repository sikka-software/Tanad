import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "./button";

const PageTitle = ({
  title,
  createButtonLink,
  createButtonText,
  createButtonDisabled,
  customButton,
}: {
  title: string;
  createButtonLink?: string;
  createButtonText?: string;
  createButtonDisabled?: boolean;
  customButton?: React.ReactNode;
}) => {
  return (
    <div className="flex !min-h-14 items-center justify-between border-b p-2">
      <h1 className="text-xl font-bold">{title}</h1>
      {customButton
        ? customButton
        : createButtonLink && (
            <Link href={createButtonLink}>
              <Button disabled={createButtonDisabled} size="sm">
                <Plus className="h-4 w-4" />
                {createButtonText}
              </Button>
            </Link>
          )}
    </div>
  );
};

export default PageTitle;
