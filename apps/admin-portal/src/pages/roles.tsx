import { ArrowLeft } from "lucide-react";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";

import RolesList from "@/components/app/new-role-dialog";
import { Button } from "@/components/ui/button";

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

      <div className="container mx-auto p-4">
        <div className="mb-6 flex items-center gap-2">
          <Link href="/users">
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>

        <h1 className="mb-6 text-3xl font-bold">Role Management</h1>
        <p className="text-muted-foreground mb-8">
          Define roles and their permissions to control what users can do in the system.
        </p>

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
