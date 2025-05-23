import { useTranslations } from "next-intl";
import Head from "next/head";
import React from "react";

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
}

const CustomPageMeta: React.FC<MetaProps> = ({ title, description, keywords, author }) => {
  const t = useTranslations();

  const defaultTitle = "Tanad";
  const defaultDescription = "The backbone of your business";
  const defaultKeywords =
    "business, management, inventory, sales, purchase, accounting, finance, payroll, human resource, CRM, ERP, inventory management, sales management, purchase management, accounting management, finance management, payroll management, human resource management, CRM management, ERP management";
  const defaultAuthor = "Sikka Software";
  // const defaultTitle = t("SEO.landing.title");
  // const defaultDescription = t("SEO.landing.description");
  // const defaultKeywords = t("SEO.landing.keywords");
  // const defaultAuthor = t("SEO.landing.author");

  return (
    <Head>
      <title>{`${t("General.tanad")} | ${title || defaultTitle}`}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta charSet="utf-8" />
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords || defaultKeywords} />}
      {author && <meta name="author" content={author || defaultAuthor} />}
    </Head>
  );
};

export default CustomPageMeta;
