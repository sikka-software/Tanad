import React from "react";

import { cn } from "@/lib/utils";

const GridBG = (props: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 top-0 h-full w-full bg-[radial-gradient(#D1D4DC_1px,transparent_1px)] [mask-image:linear-gradient(1turn,#D1D4DC_50%,transparent_100%)] [background-size:16px_16px] dark:opacity-20",
        props.className,
      )}
      // To make it fade out
      // [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]
    ></div>
  );
};

export default GridBG;

// POLKA LIKE DOTS

// <div>
// <div
//   className={cn(
//     "absolute dark:opacity-20 inset-0 top-4 h-full w-full bg-[radial-gradient(#D1D4DC_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(1turn,#D1D4DC_50%,transparent_100%)]",
//     props.className
//   )}
//   // To make it fade out
//   // [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]
// ></div>
// <div
//   className={cn(
//     "absolute dark:opacity-20 inset-2 top-10  h-full  bg-[radial-gradient(#D1D4DC_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(1turn,#D1D4DC_50%,transparent_100%)]",
//     props.className
//   )}
//   style={{ width: "calc(100% - 8px)" }}
//   // To make it fade out
//   // [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]
// ></div>
// </div>
