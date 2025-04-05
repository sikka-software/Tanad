import { Plus } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

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
    <div className=" p-4  border-b flex justify-between items-center !min-h-20">
      <h1 className="text-2xl font-bold">{title}</h1>
      {customButton
        ? customButton
        : createButtonLink && (
            <Link href={createButtonLink}>
              <Button disabled={createButtonDisabled}>
                <Plus className="h-4 w-4" />
                {createButtonText}
              </Button>
            </Link>
          )}
    </div>
  );
};

export default PageTitle;
