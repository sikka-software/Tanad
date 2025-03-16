import { GetStaticProps } from "next";

const Dashboard = () => {
  return <div>Dashboard</div>;
};

export default Dashboard;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
