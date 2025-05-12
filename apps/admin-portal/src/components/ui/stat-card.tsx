import { Plus } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

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
  const [isHovered, setIsHovered] = useState(false);

  const cardContent = (
    <>
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="relative flex w-full flex-row justify-between overflow-hidden p-4">
          <div className="bg--500 flex flex-row items-center justify-start gap-2">
            {icon && icon}
            <CardTitle className="bg--900 !m-0 text-sm leading-none font-medium tracking-tight text-gray-500">
              {title}
            </CardTitle>
          </div>
          <motion.div
            initial={{ x: -27, y: -27, opacity: 0 }}
            animate={isHovered ? "hover" : "rest"}
            variants={{
              rest: { x: -27, y: -27, opacity: 0 },
              hover: { x: -17, y: -17, opacity: 1 },
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            // className="absolute -end-3 top-1/2 flex -translate-y-1/2 items-center justify-center group-hover:z-10"
          >
            <Button
              size="icon_sm"
              variant="outline"
              className={
                "relative cursor-pointer rounded-e-none rounded-t-none border-e-0 border-t-0 bg-transparent group-hover:z-10"
              }
              // className="absolute end-0 top-0 cursor-pointer rounded-e-none rounded-t-none border-e-0 border-t-0 opacity-0 transition-opacity group-hover:opacity-100"
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
          </motion.div>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <Skeleton className="h-8 w-1/2" />
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
          {additionalText && <p className="mt-1 text-xs text-gray-500">{additionalText}</p>}
        </CardContent>
      </div>
    </>
  );

  return link ? (
    <Link href={link}>
      <Card className="group h-full cursor-pointer transition-shadow hover:shadow-lg">
        {cardContent}
      </Card>
    </Link>
  ) : (
    <Card className="group h-full">{cardContent}</Card>
  );
}
