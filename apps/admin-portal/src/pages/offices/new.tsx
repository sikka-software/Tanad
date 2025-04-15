import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { OfficeForm } from "@/components/forms/office-form";
import { useCreateOffice } from "@/hooks/mutations/use-create-office";

export default function NewOfficePage() {
  const t = useTranslations();
  const router = useRouter();
  const { mutate: createOffice, isLoading } = useCreateOffice();

  const handleSubmit = async (data: any) => {
    createOffice(data, {
      onSuccess: () => {
        router.push("/offices");
      },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("Offices.add_new")}
        description={t("Offices.office_details")}
        action={
          <Button variant="ghost" onClick={() => router.push("/offices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Offices.back_to_list")}
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-2xl">
        <OfficeForm onSubmit={handleSubmit} isSubmitting={isLoading} />
      </div>
    </div>
  );
} 