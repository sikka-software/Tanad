import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";
import { JSX } from "react";

type Props = {
  placeholder: string;
  className?: string;
  placeholderClassName?: string;
};

export function ContentEditable({
  placeholder,
  className,
  placeholderClassName,
}: Props): JSX.Element {
  return (
    <LexicalContentEditable
      className={
        className ??
        `ContentEditable__root relative block min-h-72 overflow-auto px-8 py-4 focus:outline-none`
      }
      aria-placeholder={placeholder}
      placeholder={
        <div
          className={
            placeholderClassName ??
            `text-muted-foreground pointer-events-none absolute start-0 top-0 w-full overflow-hidden px-8 py-[18px] text-ellipsis select-none`
          }
        >
          {placeholder}
        </div>
      }
    />
  );
}
