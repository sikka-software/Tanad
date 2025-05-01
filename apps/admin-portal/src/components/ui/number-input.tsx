import { useRef, useEffect } from "react";

import { Input } from "./input";

const NumberInput = ({ ...props }) => {
  const domRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const preventInputScroll = (e: WheelEvent) => e.preventDefault();
    domRef.current?.addEventListener("wheel", preventInputScroll);
    return () => {
      domRef.current?.removeEventListener("wheel", preventInputScroll);
    };
  });
  return <Input type="number" ref={domRef} {...props} />;
};

export default NumberInput;
