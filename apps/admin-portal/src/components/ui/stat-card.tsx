import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

import { Button } from "./button";

interface StatCardProps {
  title: string;
  value: number | string;
  loading: boolean;
  link?: string;
  additionalText?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, loading, link, additionalText, icon }: StatCardProps) {
  const router = useRouter();
  const linkToAdd = link ? `${link}/add` : undefined;

  const cardContent = (
    <>
      <CardHeader className="relative flex w-full flex-row justify-between p-4">
        <div className="bg--500 flex flex-row items-center justify-start gap-2">
          {icon && icon}
          <CardTitle className="bg--900 !m-0 text-sm leading-none font-medium tracking-tight text-gray-500">
            {title}
          </CardTitle>
        </div>
        <Button
          size="icon_sm"
          variant="outline"
          className="absolute end-0 top-0 cursor-pointer rounded-e-none rounded-t-none border-e-0 border-t-0"
          style={{
            borderStartEndRadius: "var(--radius)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            router.push(linkToAdd || "/dashboard");
          }}
        >
          <Plus className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
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
