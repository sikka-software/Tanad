import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number | string;
  loading: boolean;
  link?: string;
  additionalText?: string;
}

export function StatCard({ title, value, loading, link, additionalText }: StatCardProps) {
  const cardContent = (
    <>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-1/2" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {additionalText && <p className="mt-1 text-xs text-gray-500">{additionalText}</p>}
      </CardContent>
    </>
  );

  return link ? (
    <Link href={link}>
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">{cardContent}</Card>
    </Link>
  ) : (
    <Card className="h-full">{cardContent}</Card>
  );
}
