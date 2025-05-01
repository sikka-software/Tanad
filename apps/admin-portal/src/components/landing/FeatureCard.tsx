import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/card";
import { Chip } from "@/ui/chip";
import { cn } from "@/lib/utils";
import CustomMotionDiv from "@/components/landing/CustomMotionDiv";

type FeatureCardProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  index?: any;
  subtitle?: string;
  clickable?: boolean;
  soon?: boolean;
  soonText?: string;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ id, index, ...props }) => {
  return (
    <CustomMotionDiv transition={{ delay: 0.1 * index }} className="w-full">
      <Card
        id={id}
        className={cn(
          "w-full bg-background h-full overflow-clip",
          props.className,
        )}
        // clickable={props.clickable}
      >
        <CardHeader className="relative">
          {props.soon && (
            <div className="absolute end-4 top-4">
              <Chip label={props.soonText || ""} />
            </div>
          )}
          <CustomMotionDiv transition={{ delay: 0.1 }}>
            {props.icon}
          </CustomMotionDiv>
          <CustomMotionDiv transition={{ delay: 0.2 }}>
            <CardTitle>{props.title}</CardTitle>
          </CustomMotionDiv>
          <CustomMotionDiv transition={{ delay: 0.3 }}>
            <CardDescription>{props.subtitle}</CardDescription>
          </CustomMotionDiv>
        </CardHeader>
      </Card>
    </CustomMotionDiv>
  );
};

export default FeatureCard;
