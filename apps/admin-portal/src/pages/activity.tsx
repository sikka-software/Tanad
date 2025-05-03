import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import DataPageLayout from "@/components/layouts/data-page-layout";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ActivityLogDialog } from "@/modules/activity/activity.dialog";
import { ActivityLogFilters } from "@/modules/activity/activity.filters";
import { ActivityLogTable } from "@/modules/activity/activity.table";

const ActivityPage = () => {
  const t = useTranslations();
  return (
    <DataPageLayout>
      <CardHeader className="pb-3">
        <CardTitle>{t("ActivityLogs.title")}</CardTitle>
        <CardDescription>{t("ActivityLogs.description")}</CardDescription>
      </CardHeader>
      <div className="flex flex-col gap-4 p-4">
        <ActivityLogFilters />
        <ActivityLogTable />
      </div>
      <ActivityLogDialog />
    </DataPageLayout>
  );
};

export default ActivityPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
