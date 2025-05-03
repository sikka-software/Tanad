import { GetStaticProps } from "next";

import DataPageLayout from "@/components/layouts/data-page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ActivityLogFilters } from "@/modules/activity/activity.filters";
import { ActivityLogTable } from "@/modules/activity/activity.table";

const ActivityPage = () => {
  return (
    <DataPageLayout>
      <CardHeader className="pb-3">
        <CardTitle>User Activity</CardTitle>
        <CardDescription>
          Events related to user actions, permissions, and account changes.
        </CardDescription>
      </CardHeader>
      <div className="p-4">
        <ActivityLogFilters eventType="user" />
        <ActivityLogTable eventType="user" />
      </div>
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
