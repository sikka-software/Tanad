import { useRef, useEffect } from "react";

import { Input } from "./input";

interface NumberInputProps extends React.ComponentProps<typeof Input> {
  maxLength?: number;
}

const NumberInput = ({ maxLength, ...props }: NumberInputProps) => {
  const domRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const preventInputScroll = (e: WheelEvent) => e.preventDefault();
    domRef.current?.addEventListener("wheel", preventInputScroll);
    return () => {
      domRef.current?.removeEventListener("wheel", preventInputScroll);
    };
  }, []);

  // Handler to enforce maxLength for number input
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (maxLength && e.currentTarget.value.length > maxLength) {
      e.currentTarget.value = e.currentTarget.value.slice(0, maxLength);
    }
    if (props.onInput) {
      props.onInput(e);
    }
  };

  return (
    <Input
      type="number"
      ref={domRef}
      maxLength={maxLength}
      {...props}
      onInput={handleInput}
    />
  );
};

export default NumberInput;
