import { GetStaticProps } from "next";

import DepartmentBox from "../components/landing/pricing/department-box";
import PricingCalculator from "../components/landing/pricing/pricing-calculator";
import PricingHero from "../components/landing/pricing/pricing-hero";
import { initialDepartments } from "../stores/landing-pricing-store";

const CustomPricingPage = () => {
  return (
    <div className="my-20">
      {" "}
      <main className="flex-grow">
        <PricingHero />

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {initialDepartments.map((department) => (
              <DepartmentBox key={department.id} department={department} />
            ))}
          </div>

          <div className="mt-12">
            <PricingCalculator />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomPricingPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
