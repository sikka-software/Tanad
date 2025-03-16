import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
// Components
import CustomMotionDiv from "@/components/landing/CustomMotionDiv";

const HeroSection = (props: any) => {
  const t = useTranslations("Landing");
  const parentVariant = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.3 } },
  };
  return (
    <motion.div
      className="flex flex-col items-center justify-center"
      variants={parentVariant}
      initial="hidden"
      animate="show"
    >
      <CustomMotionDiv
        className={
          "hero-text w-full text-center text-[40px] font-bold leading-normal md:text-[70px]"
        }
      >
        {props.title}
      </CustomMotionDiv>
      <CustomMotionDiv
        delay={0.2}
        className="mt-8 max-w-5xl text-center md:text-[28px]"
      >
        {props.subtitle}
      </CustomMotionDiv>
      {props.withAction && (
        <motion.div
          variants={parentVariant}
          className="mt-6 flex flex-col gap-2 md:flex-row"
        >
          <CustomMotionDiv delay={0.4}>
            <Link href={props.actionPath}>
              <Button aria-label={t("hero.primary-action")} className="w-full">
                <span className="text-lg">{t("hero.primary-action")}</span>
              </Button>
            </Link>
          </CustomMotionDiv>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HeroSection;
