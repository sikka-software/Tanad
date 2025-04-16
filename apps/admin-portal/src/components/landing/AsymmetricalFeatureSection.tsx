import { Button } from "@/ui/button";

import CustomMotionDiv from "@/components/landing/CustomMotionDiv";

import { cn } from "@/lib/utils";

type AsymmetricalFeatureSectionProps = {
  superTitle?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  hideButton?: boolean;
  side?: "right" | "left";
  children?: any;
  additionalContent?: any;
};

const AsymmetricalFeatureSection = (props: AsymmetricalFeatureSectionProps) => {
  return (
    <div className="flex h-full min-h-[500px] justify-center border-y">
      <div
        className={cn(
          "flex h-full min-h-[500px] w-full max-w-5xl flex-col items-center justify-between self-center px-8 py-20 lg:px-8",
          {
            "md:flex-row": props.side === "right",
            "md:flex-row-reverse": props.side === "left",
          },
        )}
      >
        <div className="flex w-full max-w-lg flex-col justify-center gap-4">
          <CustomMotionDiv delay={0.2} className="text-sm font-bold">
            {props.superTitle}
          </CustomMotionDiv>
          <CustomMotionDiv
            delay={0.4}
            className="text-center text-5xl leading-normal font-extrabold md:text-start"
          >
            {props.title}
          </CustomMotionDiv>
          <CustomMotionDiv delay={0.6} className="text-center text-lg md:text-start">
            {props.subtitle}
          </CustomMotionDiv>
          {!props.hideButton && (
            <CustomMotionDiv delay={0.8} className="text-sm">
              <Button aria-label={props.buttonText} className="w-fit">
                {props.buttonText}
              </Button>
            </CustomMotionDiv>
          )}

          {props.additionalContent && (
            <CustomMotionDiv
              delay={1}
              className="flex flex-col items-center justify-center md:items-start"
            >
              {props.additionalContent}
            </CustomMotionDiv>
          )}
        </div>
        {props.children}
      </div>
    </div>
  );
};

export default AsymmetricalFeatureSection;
