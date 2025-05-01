import { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

interface DataModelListProps<T> {
  data?: T[];
  isLoading: boolean;
  error: Error | null;
  emptyMessage: string;
  errorMessage?: string;
  addFirstItemMessage?: string;
  renderItem: (item: T) => ReactNode;
  gridCols?: "1" | "2" | "3";
  skeletonCount?: number;
}

export default function DataModelList<T>({
  data = [],
  isLoading,
  error,
  emptyMessage,
  errorMessage,
  addFirstItemMessage,
  renderItem,
  gridCols = "3",
  skeletonCount = 3,
}: DataModelListProps<T>) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-${gridCols}`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        {errorMessage || "An error occurred while fetching data"}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
        {addFirstItemMessage && (
          <p className="text-primary hover:text-primary/90 mt-2 inline-flex items-center gap-2">
            {addFirstItemMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-${gridCols}`}>
      {data.map(renderItem)}
    </div>
  );
}
