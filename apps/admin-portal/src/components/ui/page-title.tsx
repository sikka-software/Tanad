import { Loader2, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "./button";

const PageTitle = ({
  createButtonLink,
  createButtonText,
  createButtonDisabled,
  customButton,
  dummyButton,
  loading,
  formButtons,
  texts,
  onCancel,
  formId,
}: {
  onCancel?: () => void;
  dummyButton?: () => void;
  createButtonLink?: string;
  createButtonText?: string;
  createButtonDisabled?: boolean;
  customButton?: React.ReactNode;
  formButtons?: boolean;
  formId?: string;
  loading?: boolean;
  texts?: {
    title?: string;
    submit_form?: string;
    cancel?: string;
  };
}) => {
  return (
    <div className="bg-muted sticky top-0 z-11 flex !min-h-12 items-center justify-between border-b p-2 py-0">
      {texts?.title && <h2 className="ms-2 text-xl font-bold">{texts?.title}</h2>}
      {customButton
        ? customButton
        : createButtonLink && (
            <Link href={createButtonLink}>
              <Button disabled={createButtonDisabled} size="sm" className="h-8">
                <Plus className="h-4 w-4" />
                {createButtonText}
              </Button>
            </Link>
          )}
      {formButtons && (
        <div className="flex gap-2 p-0">
          {dummyButton && process.env.NODE_ENV === "development" && (
            <Button variant="outline" size="sm" onClick={dummyButton}>
              Dummy Data
            </Button>
          )}
          {customButton
            ? customButton
            : createButtonLink && (
                <Link href={createButtonLink}>
                  <Button disabled={createButtonDisabled} size="sm" className="h-8">
                    <Plus className="h-4 w-4" />
                    {createButtonText}
                  </Button>
                </Link>
              )}
          <Button variant="outline" size="sm" className="h-8" onClick={onCancel}>
            {texts?.cancel}
          </Button>
          <Button type="submit" size="sm" form={formId} className="h-8 min-w-24" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : texts?.submit_form}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PageTitle;
