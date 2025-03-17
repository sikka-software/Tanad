import { GetStaticProps } from "next";

export default function EditProductPage() {
  return <div>EditProductPage</div>;
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
