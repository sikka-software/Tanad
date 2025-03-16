import React from "react";
// Utils
import { cn } from "@/lib/utils";

type ContentLayoutType = {
  children?: any;
  extraTopPadding?: boolean;
};

const ContentLayout: React.FC<ContentLayoutType> = (props) => {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center",
      )}
    >
      <div
        className={cn(
          " flex h-full w-full max-w-4xl flex-col gap-4 p-6 pb-10  md:pe-10",
          props.extraTopPadding ? "pt-20" : "pt-10",
        )}
      >
        {props.children}
      </div>
    </div>
  );
};

export default ContentLayout;