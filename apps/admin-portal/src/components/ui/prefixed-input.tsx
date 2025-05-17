import { Input } from "@/ui/inputs/input";
import NumberInput from "@/ui/inputs/number-input";

import { cn } from "@/lib/utils";

export default function PrefixedInput({
  prefix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="*:not-first:mt-2" dir="ltr">
      <div className="flex rounded-md shadow-xs">
        <span className="border-input bg-background text-muted-foreground -z-10 inline-flex items-center rounded-s-md border px-3 text-sm">
          {prefix}
        </span>
        {props.type === "number" ? (
          <NumberInput {...props} className={cn("-ms-px rounded-s-none shadow-none")} />
        ) : (
          <Input className="-ms-px rounded-s-none shadow-none" {...props} />
        )}
      </div>
    </div>
  );
}
