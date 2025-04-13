// Components
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { useAuth } from "@/components/UserContext";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from "@/hooks/use-subscription";

export default function Billing() {
  const t = useTranslations();
  const { user } = useAuth();
  const subscription = useSubscription();

  // Show subscription management for active subscriptions (including canceled ones)
  const showSubscriptionManagement =
    subscription.status === "active" && subscription.name !== t("plans.hobby.title");

  if (subscription.loading || !user) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  return (
    <>
      <CustomPageMeta title={t("Billing.title")} description={t("Billing.description")} />
      <main className={`flex flex-col items-center justify-between`}>
        {user?.subscribed_to ? (
          <div>
            <h1>{t("Billing.title")}</h1>
          </div>
        ) : (
          <div>{t("Billing.upgrade_dialog.title")}</div>
        )}
      </main>
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
