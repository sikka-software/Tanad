import { useMemo, useRef } from "react";
import { useDebounce as useDebouncePackage } from "use-debounce";

export function useDebounce<T extends (...args: never[]) => void>(
  fn: T,
  ms: number,
  maxWait?: number,
) {
  const [debouncedCallback] = useDebouncePackage(fn, ms, { maxWait });
  return debouncedCallback as T;
}
