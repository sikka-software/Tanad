import { GetStaticProps } from "next";
import { ActivityLogTable } from "@/modules/activity/activity.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
// import Head from 'next/head'; // Could add this later for title

const ActivityPage = () => {
  return (
    <DataPageLayout>
       {/* <Head><title>Activity Log</title></Head> */}
       <ActivityLogTable />
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
