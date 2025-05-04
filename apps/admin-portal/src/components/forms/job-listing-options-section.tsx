import { useTranslations } from "next-intl";

import FormSectionHeader from "./form-section-header";

const JobListingOptionsSection = () => {
  const t = useTranslations();
  return (
    <div>
      <FormSectionHeader title={t("JobListings.options.title")} />
    </div>
  );
};

export default JobListingOptionsSection;
