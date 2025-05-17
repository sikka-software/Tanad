import Link from "next/link";

import { Button } from "@/ui/button";

type BottomCTAProps = {
  title: string;
  subtitle: string;
  primaryActionText: string;
  primaryActionSlug: string;
  secondaryActionText?: string;
  secondaryActionSlug?: string;
};

const BottomCTA = (props: BottomCTAProps) => (
  <div className="flex w-full flex-col items-center justify-center gap-10 border-t p-10 md:p-24">
    <div className="text-center text-2xl font-bold">{props.title}</div>
    <div className="text-center">{props.subtitle}</div>
    <div className="flex flex-row gap-6">
      <Link href={props.primaryActionSlug}>
        <Button aria-label={props.primaryActionText}>{props.primaryActionText}</Button>
      </Link>
      {props.secondaryActionText && (
        <Link href={props.secondaryActionSlug || ""}>
          <Button variant={"outline"} aria-label={props.secondaryActionText}>
            {props.secondaryActionText}
          </Button>
        </Link>
      )}
    </div>
  </div>
);

export default BottomCTA;
