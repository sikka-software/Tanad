import Link from "next/link";

import { Loader2, Plus } from "lucide-react";

import { Button } from "./button";

const PageTitle = ({
  title,
  createButtonLink,
  createButtonText,
  createButtonDisabled,
  customButton,
  loading,
  formButtons,
  texts,
  onCancel,
  formId,
}: {
  onCancel?: () => void;
  title: string;
  createButtonLink?: string;
  createButtonText?: string;
  createButtonDisabled?: boolean;
  customButton?: React.ReactNode;
  formButtons?: boolean;
  formId?: string;
  loading?: boolean;
  texts?: {
    submit_form: string;
    cancel: string;
  };
}) => {
  return (
    <div className="bg-background sticky top-0 flex !min-h-14 items-center justify-between border-b p-2">
      <h1 className="text-xl font-bold">{title}</h1>
      {formButtons && (
        <>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              {texts?.cancel}
            </Button>
            <Button type="submit" size="sm" form={formId} className="min-w-24" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : texts?.submit_form}
            </Button>
          </div>
        </>
      )}
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
