import React from "react";
// UI
import { Button } from "@/ui/button";
import { Logos } from "@/ui/logos";
// Components
import CustomMotionDiv from "@/components/landing/CustomMotionDiv";

type SocialIconsType = {
  whatsapp?: string;
  twitter?: string;
  instagram?: string;
  mail?: string;
  phone?: string;
};

const SocialIcons: React.FC<SocialIconsType> = (props) => {
  return (
    <>
      {props.whatsapp && (
        <CustomMotionDiv>
          <a href={props.whatsapp}>
            <Button aria-label="Whatsapp" size={"icon"} variant={"ghost"}>
              <Logos.whatsapp className="w-5" />
            </Button>
          </a>
        </CustomMotionDiv>
      )}
      {props.twitter && (
        <CustomMotionDiv delay={0.1}>
          <a href={props.twitter}>
            <Button aria-label="Twitter" size={"icon"} variant={"ghost"}>
              <Logos.twitter className="w-5" />
            </Button>
          </a>
        </CustomMotionDiv>
      )}
      {props.instagram && (
        <CustomMotionDiv delay={0.2}>
          <a href={props.instagram}>
            <Button aria-label="Instagram" size={"icon"} variant={"ghost"}>
              <Logos.instagram className="w-5" />
            </Button>
          </a>
        </CustomMotionDiv>
      )}
      {props.mail && (
        <CustomMotionDiv delay={0.3}>
          <a href={`mailto:${props.mail}`}>
            <Button aria-label="Mail" size={"icon"} variant={"ghost"}>
              <Logos.mail className="w-5" />
            </Button>
          </a>
        </CustomMotionDiv>
      )}
      {props.phone && (
        <CustomMotionDiv delay={0.4}>
          <a href={`tel:${props.phone}`}>
            <Button aria-label="Phone" size={"icon"} variant={"ghost"}>
              <Logos.phone className="w-5" />
            </Button>
          </a>
        </CustomMotionDiv>
      )}
    </>
  );
};

export default SocialIcons;
