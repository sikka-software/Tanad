import { motion, useScroll, useSpring, useTransform } from "motion/react";

import { useMediaQuery } from "@/hooks/use-media-query";

const FloatingPuklas = () => {
  const { scrollYProgress } = useScroll();
  const scrollMotionSpring = useSpring(scrollYProgress, {
    stiffness: 100,
    bounce: 0,
    mass: 0.1,
    duration: 0.25,
  });
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const centerYPosition = useTransform(scrollMotionSpring, [0, 1], [isDesktop ? 100 : -100, -300]);
  const innerYPosition = useTransform(scrollMotionSpring, [0, 1], [isDesktop ? 100 : -100, 300]);
  const outerYPosition = useTransform(scrollMotionSpring, [0, 1], [isDesktop ? 100 : -100, 500]);

  // Different X positions for mobile and desktop
  const leftInnerXPosition = useTransform(scrollMotionSpring, [0, 1], [0, isDesktop ? -900 : -500]);
  const leftOuterXPosition = useTransform(
    scrollMotionSpring,
    [0, 1],
    [0, isDesktop ? -1800 : -1000],
  );
  const rightInnerXPosition = useTransform(scrollMotionSpring, [0, 1], [0, isDesktop ? 900 : 500]);
  const rightOuterXPosition = useTransform(
    scrollMotionSpring,
    [0, 1],
    [0, isDesktop ? 1800 : 1000],
  );

  const boxWidth = isDesktop ? 400 : 200;
  const boxHeight = isDesktop ? 800 : 400;

  const floatingImageClassName = "absolute drop-shadow-2xl object-cover rounded-xl";

  // Add rotation transforms
  const leftOuterRotation = useTransform(scrollMotionSpring, [0, 1], [0, isDesktop ? -30 : -20]);
  const leftInnerRotation = useTransform(scrollMotionSpring, [0, 1], [0, isDesktop ? -15 : -10]);
  const rightInnerRotation = useTransform(scrollMotionSpring, [0, 1], [0, isDesktop ? 15 : 10]);
  const rightOuterRotation = useTransform(scrollMotionSpring, [0, 1], [0, isDesktop ? 30 : 20]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="relative flex h-full min-h-[800px] w-full items-center justify-center overflow-hidden"
    >
      {/* Left outer box */}
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        src="/assets/had_hero_mockup.png"
        className={floatingImageClassName}
        style={{
          willChange: "transform",
          y: outerYPosition,
          x: leftOuterXPosition,
          width: boxWidth,
          height: boxHeight,
          rotate: leftOuterRotation,
        }}
      />

      {/* Left inner box */}
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        src="/assets/surub_hero_mockup.png"
        className={floatingImageClassName}
        style={{
          willChange: "transform",
          y: innerYPosition,
          x: leftInnerXPosition,
          width: boxWidth,
          height: boxHeight,
          rotate: leftInnerRotation,
        }}
      />

      {/* Right outer box */}
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        src="/assets/aburito_hero_mockup.png"
        className={floatingImageClassName}
        style={{
          willChange: "transform",
          y: outerYPosition,
          x: rightOuterXPosition,
          width: boxWidth,
          height: boxHeight,
          rotate: rightOuterRotation,
        }}
      />

      {/* Right inner box */}
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        src="/assets/sikka_hero_mockup.png"
        className={floatingImageClassName}
        style={{
          willChange: "transform",
          y: innerYPosition,
          x: rightInnerXPosition,
          width: boxWidth,
          height: boxHeight,
          rotate: rightInnerRotation,
        }}
      />

      {/* Center box */}
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        src="/assets/pukla_hero_mockup.png"
        className={floatingImageClassName}
        style={{
          willChange: "transform",
          y: centerYPosition,
          width: boxWidth,
          height: boxHeight,
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-background absolute top-0 bottom-0 h-full w-full [mask-image:linear-gradient(to_bottom,transparent_10%,#000_100%)]"
      />
    </motion.div>
  );
};

export default FloatingPuklas;
