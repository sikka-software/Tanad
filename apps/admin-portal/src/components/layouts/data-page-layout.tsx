import { cn } from "@/lib/utils";

import { useSidebar } from "../ui/sidebar";

const DataPageLayout = ({
  children,
  count,
  itemsText,
}: {
  children: React.ReactNode;
  count?: number;
  itemsText?: string;
}) => {
  const { state, isMobile } = useSidebar();
  return (
    <div
      className={cn(
        "flex w-full flex-col justify-between transition-all duration-200 ease-linear",
        {
          "min-h-[calc(100vh-87px)] w-full max-w-[calc(100vw)]": isMobile,
          "min-h-[calc(100vh-50px)] w-full max-w-[calc(100vw-16rem)]":
            state === "expanded" && !isMobile,
          "min-h-[calc(100vh-50px)] w-full max-w-[calc(100vw-3rem)]":
            state !== "expanded" && !isMobile,
        },
      )}
    >
      <div>{children}</div>
      {count && (
        <div className="w-full border-t">
          <p className="text-muted-foreground p-1 px-4 text-xs">
            {itemsText} {count}
          </p>
        </div>
      )}
    </div>
  );
};

export default DataPageLayout;
