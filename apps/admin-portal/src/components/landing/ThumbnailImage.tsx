import Image from "next/image";
import React, { useState } from "react";

// UI
import { Skeleton } from "@/ui/skeleton";

// Utils
import { cn } from "@/lib/utils";

type ThumbnailImageType = {
  src?: any;
  alt?: any;
  width?: number;
  height?: number;
  skeletonClassname?: string;
  imageClassname?: string;
  containerClassname?: string;
  priority?: boolean;
};

const ThumbnailImage = ({ src, alt, ...props }: ThumbnailImageType) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn("relative", props.containerClassname)}>
      {isLoading && <Skeleton className={props.skeletonClassname} />}
      <Image
        alt={alt}
        height={props.height}
        width={props.width}
        src={src}
        className={props.imageClassname}
        onLoad={() => setIsLoading(false)}
        priority={props.priority}
      />
    </div>
  );
};

export default ThumbnailImage;
