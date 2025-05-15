import { useId } from "react";

import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/label";
// import { SelectNative } from "@/components/ui/select-native";

export default function Component() {
  const id = useId();
  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>Input with end select</Label>
      <div className="flex rounded-md shadow-xs">
        <Input
          id={id}
          className="-me-px rounded-e-none shadow-none focus-visible:z-10"
          placeholder="google"
          type="text"
        />
        {/* <SelectNative className="text-muted-foreground hover:text-foreground w-fit rounded-s-none shadow-none">
          <option>.com</option>
          <option>.org</option>
          <option>.net</option>
        </SelectNative> */}
      </div>
    </div>
  );
}
