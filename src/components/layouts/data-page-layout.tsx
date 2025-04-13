import { cn } from "@/lib/utils";

import { useSidebar } from "../ui/sidebar";

const DataPageLayout = ({ children }: { children: React.ReactNode }) => {
  const { state, isMobile } = useSidebar();

  return (
    <div
      className={cn(
        "w-full transition-all duration-300",

        {
          "w-full max-w-[calc(100vw)]": isMobile,
          "w-full max-w-[calc(100vw-16rem)]": state === "expanded" && !isMobile,
          "w-full max-w-[calc(100vw-3rem)]": state !== "expanded" && !isMobile,
        },
      )}
    >
      {children}
    </div>
  );
};

export default DataPageLayout;
