import { useQueryClient } from "@tanstack/react-query";
import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { createClient } from "@/utils/supabase/component";

import DataPageLayout from "@/components/layouts/data-page-layout";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ActivityLogDialog } from "@/modules/activity/activity.dialog";
import { ActivityLogFilters } from "@/modules/activity/activity.filters";
import { useActivityLogs, activityLogKeys } from "@/modules/activity/activity.hook";
import { ActivityLogTable } from "@/modules/activity/activity.table";

import CustomPageMeta from "../components/landing/CustomPageMeta";

const ActivityPage = () => {
  const t = useTranslations();
  const queryClient = useQueryClient(); // Get query client
  const { data, isLoading, error } = useActivityLogs(1, 10); // Default page 1, pageSize 10

  useEffect(() => {
    // Data fetching is handled by the useActivityLogs hook.
    // Log data or error
    if (data) {
      // console.log("Activity logs:", data);
    }
    if (error) {
      console.error("Error fetching activity logs:", error);
    }
  }, [data, error]);

  useEffect(() => {
    const supabase = createClient(); // Create Supabase client instance

    const channel = supabase
      .channel("activity_log_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        (payload) => {
          // console.log("New activity log received:", payload.new);
          // Invalidate the query to refetch activity logs
          queryClient.invalidateQueries({ queryKey: activityLogKeys.lists() });
        },
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]); // Add queryClient to dependency array

  return (
    <div>
      <CustomPageMeta title={t("ActivityLogs.title")} description={t("ActivityLogs.description")} />
      <DataPageLayout>
        <CardHeader className="p-4 pb-0">
          <CardTitle>{t("ActivityLogs.title")}</CardTitle>
          <CardDescription>{t("ActivityLogs.description")}</CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-4 p-4">
          <ActivityLogFilters />
          <ActivityLogTable />
        </div>
        <ActivityLogDialog />
      </DataPageLayout>
    </div>
  );
};

export default ActivityPage;

ActivityPage.messages = ["Metadata","Pages", "General", "ActivityLogs"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../locales/${locale}.json`)).default, ActivityPage.messages),
    },
  };
};
