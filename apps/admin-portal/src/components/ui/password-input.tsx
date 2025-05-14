import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Button } from "./button";
import { Input } from "./input";

const PasswordInput = (props: React.ComponentProps<"input">) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input type={showPassword ? "text" : "password"} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute end-0 top-0 m-0.5 size-8 px-3 py-2"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
      >
        {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </Button>
    </div>
  );
};

export default PasswordInput;
