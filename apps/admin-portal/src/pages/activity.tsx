import { GetStaticProps } from "next";

const ActivityPage = () => {
  return <div>Activity</div>;
};

export default ActivityPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
