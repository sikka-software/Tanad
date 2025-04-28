import { ArrowLeft, Plus } from "lucide-react";
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
        texts={{
          submit_form: "Create Role",
          cancel: "Cancel",
          title: "Role Management",
        }}
        customButton={
          <Button
            size={"sm"}
            // onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="me-2 h-4 w-4" /> Add Role
          </Button>
        }
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
