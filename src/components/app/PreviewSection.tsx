import React from "react";
import { Loader2 } from "lucide-react";
// Components
import { PuklaView } from "@/components/app/PuklaView";
import { CurrentPuklaInfo } from "@/components/app/CurrentPuklaInfo";
import PhoneMockup from "@/components/app/PhoneMockup";

type PreviewSectionProps = {
  pukla?: any;
  isLoading?: boolean;
};

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  pukla,
  isLoading,
}) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <CurrentPuklaInfo
      // total={pukla?.links.length}
      // puklaName={pukla?.title}
      // url={`${process.env.NEXT_PUBLIC_PUKLA_PORTAL}/${pukla?.slug}`}
      // puklaLink={`${process.env.NEXT_PUBLIC_PUKLA_PORTAL}/${pukla?.slug}`}
      />
      <PhoneMockup>
        {isLoading ? (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <PuklaView pukla={pukla} />
        )}
      </PhoneMockup>
    </div>
  );
};
