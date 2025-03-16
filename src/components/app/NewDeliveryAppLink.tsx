import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export const NewDeliveryAppLink = () => {
  const t = useTranslations();
  let deliveryApps = [
    {
      type: "hungerstation",
      bgColor: "#fbef01",
      name: t("Editor.delivery_apps.hungerstation"),
      icon: (
        <Image
          alt="Hungerstation"
          // className="contrast-0"
          src="https://sikka-images.s3.ap-southeast-1.amazonaws.com/platforms/logo-hungerstation.png"
          height={50}
          width={80}
        />
      ),
    },
    {
      type: "jahez",
      bgColor: "#e11a2c",
      icon: (
        <Image
          className="h-auto w-20"
          alt="Hungerstation"
          src="https://sikka-images.s3.ap-southeast-1.amazonaws.com/platforms/logo-jahez.png"
          height={100}
          width={100}
        />
      ),
      name: t("Editor.delivery_apps.jahez"),
    },
    {
      type: "keeta",
      bgColor: "#fce51e",
      icon: (
        <Image
          className="h-10 w-auto brightness-0"
          alt="Keeta"
          src="https://sikka-images.s3.ap-southeast-1.amazonaws.com/platforms/logo-keeta.png"
          height={100}
          width={100}
        />
      ),
      name: t("Editor.delivery_apps.keeta"),
    },
    {
      type: "mrsool",
      bgColor: "#2ec06e",
      icon: (
        <Image
          className="h-auto w-12 brightness-0"
          alt="Mrsool"
          src="https://sikka-images.s3.ap-southeast-1.amazonaws.com/platforms/logo-mrsool.png"
          height={100}
          width={100}
        />
      ),
      name: t("Editor.delivery_apps.mrsool"),
    },
    {
      type: "toyou",
      bgColor: "#0d3562",
      icon: (
        <Image
          className="h-auto w-14 brightness-100"
          alt="ToYou"
          src="https://sikka-images.s3.ap-southeast-1.amazonaws.com/platforms/logo-to-you.png"
          height={100}
          width={100}
        />
      ),
      name: t("Editor.delivery_apps.toyou"),
    },
    {
      type: "careem",
      bgColor: "#3aeb78",
      icon: (
        <Image
          className="h-auto w-24 brightness-0"
          alt="Careem"
          src="https://sikka-images.s3.ap-southeast-1.amazonaws.com/platforms/logo-careem.png"
          height={100}
          width={100}
        />
      ),
      name: t("Editor.delivery_apps.careem"),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {deliveryApps?.map((d, i) => <SingleDeliverAppButton key={i} {...d} />)}
    </div>
  );
};

type SingleDeliverAppButtonProps = {
  onSelect?: () => void;
  name?: string;
  icon?: React.ReactNode;
  soon?: boolean;
  locked?: boolean;
  bgColor?: string;
};

const SingleDeliverAppButton: React.FC<SingleDeliverAppButtonProps> = ({
  name,
  icon,
  onSelect,
  bgColor,
}) => {
  return (
    <div className="bg-background rounded border">
      <div
        onClick={onSelect}
        className={
          "relative flex min-h-24 flex-col items-center justify-center gap-2  text-center"
        }
        style={{
          backgroundColor: bgColor,
        }}
      >
        {icon}
      </div>
      <p className="text-sm text-center w-full font-bold p-2">{name}</p>
    </div>
  );
};
