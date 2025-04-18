// Components
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import SubscriptionSelection from "@/components/billing/SubscriptionSelection";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from "@/hooks/use-subscription";
import useUserStore from "@/hooks/use-user-store";

export default function Billing() {
  const t = useTranslations();
  const { user } = useUserStore();
  const subscription = useSubscription();

  // Show subscription management for active subscriptions (including canceled ones)
  const showSubscriptionManagement =
    subscription.status === "active" && subscription.name !== t("Billing.free_plan");

  // Show subscription selection for new/free/expired users
  const showSubscriptionSelection =
    !subscription.loading &&
    (!subscription.status || // No subscription
      subscription.status === "canceled" || // Canceled subscription
      subscription.status === "incomplete_expired" || // Failed subscription
      subscription.status === "unpaid" || // Unpaid subscription
      (subscription.status === "active" && subscription.price === "0") || // Free plan
      (subscription.cancelAt && new Date(Number(subscription.cancelAt) * 1000) < new Date())); // Expired subscription

  if (!user) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  console.log("subscription is ", subscription);
  console.log("showSubscriptionSelection is ", showSubscriptionSelection);
  return (
    <>
      <CustomPageMeta title={t("Billing.title")} description={t("Billing.description")} />
      <main className={`flex flex-col items-center justify-between`}>
        {/* Show subscription selection for new/free/expired users */}
        {showSubscriptionSelection && (
          <div className="w-full">
            <SubscriptionSelection />
          </div>
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
