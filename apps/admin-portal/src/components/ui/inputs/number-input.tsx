import { useRef, useEffect } from "react";

import { Input } from "./input";

interface NumberInputProps extends React.ComponentProps<typeof Input> {
  maxLength?: number;
}

const NumberInput = ({ maxLength, onChange, onInput, value, ...props }: NumberInputProps) => {
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
    if (onInput) {
      onInput(e);
    }
  };

  // Handler to ensure value is a number or empty string
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    let numVal: number | "" = val === "" ? "" : Number(val);
    if (onChange) {
      // @ts-ignore: react-hook-form expects event-like signature
      onChange({ ...e, target: { ...e.target, value: numVal } });
    }
  };

  return (
    <Input
      type="number"
      ref={domRef}
      maxLength={maxLength}
      {...props}
      value={value === undefined || value === null ? "" : value}
      onInput={handleInput}
      onChange={handleChange}
    />
  );
};

export default NumberInput;
