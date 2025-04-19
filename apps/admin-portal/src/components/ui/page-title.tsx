import { Loader2, Plus } from "lucide-react";
import Link from "next/link";

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
    <div className="bg-background bg-background sticky top-0 flex !min-h-12 items-center justify-between border-b p-2 py-0">
      <h2 className="ms-2 text-xl font-bold">{title}</h2>
      {formButtons && (
        <div className="flex gap-2 p-0">
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
