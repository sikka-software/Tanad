import React from "react";
import { Loader2 } from "lucide-react";
// Utils
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  dir?: string;
  className?: string;
  size?: "small" | "medium" | "large" | "default";
}

const LoadingOverlay = ({
  isLoading,
  dir,
  className,
  size = "default",
}: LoadingOverlayProps) => {
  if (!isLoading) return null;
  return (
    <div
      className={cn(
        "absolute inset-0 border z-50 flex items-center justify-center rounded bg-background/80",
        className,
      )}
      dir={dir}
    >
      <Loader2
        className={cn(
          "animate-spin",
          size === "small" && "size-4",
          size === "medium" && "size-6",
          size === "large" && "size-8",
          size === "default" && "size-10",
        )}
      />
    </div>
  );
};

export default LoadingOverlay;
