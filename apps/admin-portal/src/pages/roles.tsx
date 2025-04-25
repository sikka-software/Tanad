import { ArrowLeft } from "lucide-react";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";

import RolesList from "@/components/app/new-role-dialog";
import { Button } from "@/components/ui/button";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import PageTitle from "@/components/ui/page-title";

export default function RolesPage() {
  return (
    <>
      <Head>
        <title>Role Management | Enterprise App</title>
        <meta
          name="description"
          content="Manage roles and permissions for your enterprise application"
        />
      </Head>

      <PageTitle
        // store={useJobsStore}
        // sortableColumns={SORTABLE_COLUMNS}
        // filterableFields={FILTERABLE_FIELDS}
        texts={{
          submit_form: "Create Role",
          cancel: "Cancel",
          title: "Role Management",
        }}
      />

      <div className="container mx-auto p-4">
        <RolesList />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
