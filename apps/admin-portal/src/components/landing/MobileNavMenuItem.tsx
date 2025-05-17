import { MotionProps, motion } from "motion/react";
import Link from "next/link";
import React, { MouseEventHandler } from "react";

// UI
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion";

type CustomMotionDivProps = MotionProps &
  React.HTMLAttributes<HTMLDivElement> & {
    trigger?: any;
    index?: number;
    path?: string;
    handleClick?: MouseEventHandler<HTMLAnchorElement>;
    item?: any;
  };
const MobileNavMenuItem: React.FC<CustomMotionDivProps> = (props) => {
  if (props.item.content) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{
          duration: 0.4,
          delay: 0.1 * (props.index || 0),
          ease: [0.22, 0.61, 0.36, 1],
        }}
        {...props}
      >
        <Accordion collapsible type="single">
          <AccordionItem value="1">
            <AccordionTrigger
              // unstyled hideArrow
              className="w-full text-start"
            >
              <div className="hover:bg-primary/10 cursor-pointer rounded-md p-6 text-3xl font-bold transition-all">
                {props.trigger}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                {props.item.subitems.map((s: any, i: number) => (
                  <div
                    key={i}
                    className="hover:bg-primary/10 flex cursor-pointer flex-row items-center gap-2 rounded-md px-4 transition-all"
                  >
                    <div className="bg-primary h-[1px] w-[10px]"></div>
                    <div className="p-2 text-lg">{s}</div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>
    );
  } else {
    return (
      <Link href={props.path || "/"} onClick={props.handleClick}>
        <motion.div
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{
            duration: 0.4,
            delay: 0.1 * (props.index || 0),
            ease: [0.22, 0.61, 0.36, 1],
          }}
          {...props}
        >
          <div className="hover:bg-primary/10 cursor-pointer rounded-md p-6 text-3xl font-bold transition-all">
            {props.trigger}
          </div>
        </motion.div>
      </Link>
    );
  }
};

export default MobileNavMenuItem;
