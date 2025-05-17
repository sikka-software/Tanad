import { Variants } from "motion/react";

import { AnimationType } from "../types";

type AnimationConfig = {
  [key in AnimationType]: {
    container: Variants;
    item: Variants;
    preview: Variants;
  };
};

export const ANIMATIONS: AnimationConfig = {
  none: {
    container: {
      initial: { opacity: 1 },
      animate: { opacity: 1, transition: { staggerChildren: 0 } },
    },
    item: {
      initial: { opacity: 1 },
      animate: { opacity: 1, transition: { duration: 0 } },
    },
    preview: {
      initial: { opacity: 1 },
      hover: { opacity: 1, transition: { duration: 0 } },
    },
  },
  slide_up: {
    container: {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: 0.1, staggerChildren: 0.1 },
      },
    },
    item: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    },
    preview: {
      initial: { y: 0, opacity: 1 },
      hover: { y: [10, 0], opacity: [0, 1], transition: { duration: 0.1 } },
    },
  },
  slide_down: {
    container: {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: 0.1, staggerChildren: 0.1 },
      },
    },
    item: {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
    },
    preview: {
      initial: { y: 0, opacity: 1 },
      hover: { y: [-10, 0], opacity: [0, 1], transition: { duration: 0.1 } },
    },
  },

  slide_left: {
    container: {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: 0.1, staggerChildren: 0.1 },
      },
    },
    item: {
      initial: { opacity: 0, x: -10 },
      animate: { opacity: 1, x: 0 },
    },
    preview: {
      initial: { x: 0, opacity: 1 },
      hover: { x: [-10, 0], opacity: [0, 1], transition: { duration: 0.1 } },
    },
  },
  slide_right: {
    container: {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: 0.1, staggerChildren: 0.1 },
      },
    },
    item: {
      initial: { opacity: 0, x: 10 },
      animate: { opacity: 1, x: 0 },
    },
    preview: {
      initial: { x: 0, opacity: 1 },
      hover: { x: [10, 0], opacity: [0, 1], transition: { duration: 0.1 } },
    },
  },

  fade: {
    container: {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: 0.1, staggerChildren: 0.1 },
      },
    },
    item: {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: 0.1 },
      },
    },
    preview: {
      initial: { opacity: 1 },
      hover: { opacity: [0, 1], transition: { duration: 0.1 } },
    },
  },
  scale: {
    container: {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: 0.1, staggerChildren: 0.1 },
      },
    },
    item: {
      initial: { opacity: 0, scale: 0.8 },
      animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.1 },
      },
    },
    preview: {
      initial: { opacity: 1, scale: 1 },
      hover: {
        scale: [0.8, 1],
        opacity: [0, 1],
        transition: { duration: 0.1 },
      },
    },
  },
};
