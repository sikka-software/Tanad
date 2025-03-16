import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, MotionProps } from "motion/react";

type CustomMotionDivProps = MotionProps &
  React.HTMLAttributes<HTMLDivElement> & {
    delay?: number;
  };

const CustomMotionDiv: React.FC<CustomMotionDivProps> = ({
  children,
  delay = 0,
  ...props
}: CustomMotionDivProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
    }
  }, [isInView]);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay,
        ease: [0.22, 0.61, 0.36, 1],
        ...props.transition
      }}
      className={props.className}
    >
      {children}
    </motion.div>
  );
};

export default CustomMotionDiv;