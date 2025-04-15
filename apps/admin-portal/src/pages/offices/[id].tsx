import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { OfficeForm } from "@/components/forms/office-form";
import { useOffice } from "@/hooks/queries/use-office";
import { useUpdateOffice } from "@/hooks/mutations/use-update-office";

export default function OfficePage() {
  const t = useTranslations();
  const router = useRouter();
  const { id } = router.query;
  const { data: office, isLoading: isLoadingOffice } = useOffice(id as string);
  const { mutate: updateOffice, isLoading: isUpdating } = useUpdateOffice();

  const handleSubmit = async (data: any) => {
    updateOffice(
      { id: id as string, ...data },
      {
        onSuccess: () => {
          router.push("/offices");
        },
      }
    );
  };

  if (isLoadingOffice) {
    return <div>{t("General.loading")}</div>;
  }

  if (!office) {
    return <div>{t("General.error")}</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("Offices.office_details")}
        description={office.name}
        action={
          <Button variant="ghost" onClick={() => router.push("/offices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Offices.back_to_list")}
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-2xl">
        <OfficeForm
          onSubmit={handleSubmit}
          isSubmitting={isUpdating}
          defaultValues={office}
        />
      </div>
    </div>
  );
} 