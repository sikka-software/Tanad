import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";
import { Check, Minus } from "lucide-react";
import { useId } from "react";
import { motion } from "motion/react";
import { useState } from "react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type AnimationSettingsProps = {
  form: UseFormReturn<{
    animation: string;
  }>;
  onUpdate: (values: { animation: string }) => void;
  initialValues: {
    animation: string;
  };
  isPending?: boolean;
};

const AnimationSettings = ({
  form,
  onUpdate,
  initialValues,
  isPending = false,
}: AnimationSettingsProps) => {
  const t = useTranslations();
  const id = useId();
  const [selectedAnimation, setSelectedAnimation] = useState(
    initialValues.animation || "fade"
  );

  const handleAnimationChange = (value: string) => {
    console.log("Animation changed to:", value);
    setSelectedAnimation(value);
    form.setValue("animation", value);
  };

  const items = [
    {
      value: "none",
      label: t("Theme.none"),
      preview: <NoAnimationPreview />,
    },
    {
      value: "slide_up",
      label: t("Theme.slide_up"),
      preview: <SlideUpPreview />,
    },
    {
      value: "slide_down",
      label: t("Theme.slide_down"),
      preview: <SlideDownPreview />,
    },
    {
      value: "slide_left",
      label: t("Theme.slide_left"),
      preview: <SlideLeftPreview />,
    },
    {
      value: "slide_right",
      label: t("Theme.slide_right"),
      preview: <SlideRightPreview />,
    },
    {
      value: "fade",
      label: t("Theme.fade"),
      preview: <FadePreview />,
    },
    {
      value: "scale",
      label: t("Theme.scale"),
      preview: <ScalePreview />,
    },
  ] as const;

  return (
    <div className="space-y-4 select-none">
      <fieldset className="space-y-4">
        <RadioGroup
          className="flex gap-3 flex-wrap"
          value={selectedAnimation}
          onValueChange={handleAnimationChange}
        >
          {items.map((item) => (
            <label key={`${id}-${item.value}`} className="cursor-pointer">
              <RadioGroupItem
                id={`${id}-${item.value}`}
                value={item.value}
                className="peer sr-only after:absolute after:inset-0"
                disabled={isPending}
              />
              {item.preview}
              <span className="group mt-2 flex items-center gap-1 peer-data-[state=unchecked]:text-muted-foreground/70">
                <Check
                  size={16}
                  strokeWidth={2}
                  className="peer-data-[state=unchecked]:group-[]:hidden"
                  aria-hidden="true"
                />
                <Minus
                  size={16}
                  strokeWidth={2}
                  className="peer-data-[state=checked]:group-[]:hidden"
                  aria-hidden="true"
                />
                <span className="text-xs font-medium">{item.label}</span>
              </span>
            </label>
          ))}
        </RadioGroup>
      </fieldset>
    </div>
  );
};
const SlideUpPreview = () => {
  const variants = {
    initial: { opacity: 1 },
    hover: { transition: { staggerChildren: 0.1 } },
    exit: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 1, y: 0 },
    hover: {
      opacity: [0, 1],
      y: [10, 0],
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      whileHover="hover"
      whileTap="hover"
      exit="exit"
      animate="initial"
      className="w-full p-2 bg-card min-w-[88px] rounded-lg gap-2 flex flex-col cursor-pointer"
    >
      {[1, 2, 3].map((num) => (
        <motion.div
          key={num}
          variants={itemVariants}
          className="w-full p-1 bg-primary text-primary-foreground rounded-lg text-xs text-center"
        >
          Button {num}
        </motion.div>
      ))}
    </motion.div>
  );
};
const SlideDownPreview = () => {
  const variants = {
    initial: { opacity: 1 },
    hover: { transition: { staggerChildren: 0.1 } },
    exit: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 1, y: 0 },
    hover: {
      opacity: [0, 1],
      y: [-10, 0],
      transition: { duration: 0.3 },
    },
    exit: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      whileHover="hover"
      whileTap="hover"
      exit="exit"
      animate="initial"
      className="w-full p-2 bg-card min-w-[88px] rounded-lg gap-2 flex flex-col cursor-pointer"
    >
      {[1, 2, 3].map((num) => (
        <motion.div
          key={num}
          variants={itemVariants}
          className="w-full p-1 bg-primary text-primary-foreground rounded-lg text-xs text-center"
        >
          Button {num}
        </motion.div>
      ))}
    </motion.div>
  );
};
const SlideLeftPreview = () => {
  const variants = {
    initial: { opacity: 1 },
    hover: { transition: { staggerChildren: 0.1 } },
    exit: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 1, x: 0 },
    hover: {
      opacity: [0, 1],
      x: [-10, 0],
      transition: { duration: 0.3 },
    },
    exit: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      whileHover="hover"
      whileTap="hover"
      exit="exit"
      animate="initial"
      className="w-full p-2 bg-card min-w-[88px] rounded-lg gap-2 flex flex-col cursor-pointer"
    >
      {[1, 2, 3].map((num) => (
        <motion.div
          key={num}
          variants={itemVariants}
          className="w-full p-1 bg-primary text-primary-foreground rounded-lg text-xs text-center"
        >
          Button {num}
        </motion.div>
      ))}
    </motion.div>
  );
};
const SlideRightPreview = () => {
  const variants = {
    initial: { opacity: 1 },
    hover: { transition: { staggerChildren: 0.1 } },
    exit: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 1, x: 0 },
    hover: {
      opacity: [0, 1],
      x: [10, 0],
      transition: { duration: 0.3 },
    },
    exit: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      whileHover="hover"
      whileTap="hover"
      exit="exit"
      animate="initial"
      className="w-full p-2 bg-card min-w-[88px] rounded-lg gap-2 flex flex-col cursor-pointer"
    >
      {[1, 2, 3].map((num) => (
        <motion.div
          key={num}
          variants={itemVariants}
          className="w-full p-1 bg-primary text-primary-foreground rounded-lg text-xs text-center"
        >
          Button {num}
        </motion.div>
      ))}
    </motion.div>
  );
};
const FadePreview = () => {
  const variants = {
    initial: { opacity: 1 },
    hover: { transition: { staggerChildren: 0.1 } },
    exit: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 1 },
    hover: {
      opacity: [0, 1],
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      whileHover="hover"
      whileTap="hover"
      exit="exit"
      animate="initial"
      className="w-full p-2 bg-card min-w-[88px] rounded-lg gap-2 flex flex-col cursor-pointer"
    >
      {[1, 2, 3].map((num) => (
        <motion.div
          key={num}
          variants={itemVariants}
          className="w-full p-1 bg-primary text-primary-foreground rounded-lg text-xs text-center"
        >
          Button {num}
        </motion.div>
      ))}
    </motion.div>
  );
};
const ScalePreview = () => {
  const variants = {
    initial: { opacity: 1 },
    hover: { transition: { staggerChildren: 0.1 } },
    exit: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 1, scale: 1 },
    hover: {
      opacity: [0, 1],
      scale: [0.8, 1],
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      whileHover="hover"
      whileTap="hover"
      exit="exit"
      animate="initial"
      className="w-full p-2 bg-card min-w-[88px] rounded-lg gap-2 flex flex-col cursor-pointer"
    >
      {[1, 2, 3].map((num) => (
        <motion.div
          key={num}
          variants={itemVariants}
          className="w-full p-1 bg-primary text-primary-foreground rounded-lg text-xs text-center"
        >
          Button {num}
        </motion.div>
      ))}
    </motion.div>
  );
};
const NoAnimationPreview = () => {
  return (
    <div className="w-full p-2 bg-card min-w-[88px] rounded-lg gap-2 flex flex-col cursor-pointer">
      {[1, 2, 3].map((num) => (
        <div
          key={num}
          className="w-full p-1 bg-primary text-primary-foreground rounded-lg text-xs text-center"
        >
          Button {num}
        </div>
      ))}
    </div>
  );
};

export default AnimationSettings;
