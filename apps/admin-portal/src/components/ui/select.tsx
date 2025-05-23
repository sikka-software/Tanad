import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { useFormField } from "./form";

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  onClear,
  isolated = false,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
  onClear?: () => void;
  value?: string;
  isolated?: boolean;
}) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const { error } = isolated ? { error: undefined } : useFormField();

  return (
    <SelectPrimitive.Trigger
      ref={triggerRef}
      data-slot="select-trigger"
      data-size={size}
      aria-invalid={!!error}
      className={cn(
        "border-input !bg-input-background placeholder:text-muted-foreground ring-offset-background focus:ring-ring data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 relative flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none select-none focus:ring-2 focus:ring-offset-2 focus:outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:rounded-b-none data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>span]:line-clamp-1",
        className,
      )}
      asChild={onClear && !!props.value}
      {...props}
    >
      <div
        className={cn(
          "relative flex w-full flex-row items-center justify-between",
          onClear &&
            !!props.value &&
            "border-input !bg-input-background placeholder:text-muted-foreground ring-offset-background focus:ring-ring data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 relative flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none select-none focus:ring-2 focus:ring-offset-2 focus:outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:rounded-b-none data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>span]:line-clamp-1",

          props.disabled && onClear && !!props.value && "cursor-not-allowed opacity-50",
        )}
      >
        {children}
        {onClear && props.value ? (
          <button
            autoFocus={false}
            type="button"
            className="rounded-inner-1 bg--400 pointer-events-auto absolute end-1 z-[51] p-1.5"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              triggerRef.current?.blur();
              onClear();
            }}
          >
            <XIcon className="size-4 opacity-50" />
          </button>
        ) : (
          <SelectPrimitive.Icon asChild>
            <ChevronDownIcon className="size-4 opacity-50" />
          </SelectPrimitive.Icon>
        )}
      </div>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "border-input bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-32 overflow-hidden rounded-md border shadow-lg [&_[role=group]]:py-1",
          position === "popper" &&
            "w-full min-w-[var(--radix-select-trigger-width)] data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)]")}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground py-1.5 ps-8 pe-2 text-xs font-medium", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center rounded py-1.5 ps-8 pe-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute start-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon size={16} />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "text-muted-foreground/80 flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon size={16} />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "text-muted-foreground/80 flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon size={16} />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

// import * as SelectPrimitive from "@radix-ui/react-select";
// import { CheckIcon, ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";
// import * as React from "react";

// import { cn } from "@/lib/utils";

// import { Button } from "./button";

// function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
//   return <SelectPrimitive.Root data-slot="select" {...props} />;
// }

// function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
//   return <SelectPrimitive.Group data-slot="select-group" {...props} />;
// }

// function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
//   return <SelectPrimitive.Value data-slot="select-value" {...props} />;
// }

// function SelectContent({
//   className,
//   children,
//   position = "popper",
//   ...props
// }: React.ComponentProps<typeof SelectPrimitive.Content>) {
//   return (
//     <SelectPrimitive.Portal>
//       <SelectPrimitive.Content
//         data-slot="select-content"
//         className={cn(
//           "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-xs",
//           position === "popper" &&
//             "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
//           className,
//         )}
//         position={position}
//         {...props}
//       >
//         <SelectScrollUpButton />
//         <SelectPrimitive.Viewport
//           className={cn(
//             "p-1",
//             position === "popper" &&
//               "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
//           )}
//         >
//           {children}
//         </SelectPrimitive.Viewport>
//         <SelectScrollDownButton />
//       </SelectPrimitive.Content>
//     </SelectPrimitive.Portal>
//   );
// }

// function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
//   return (
//     <SelectPrimitive.Label
//       data-slot="select-label"
//       className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
//       {...props}
//     />
//   );
// }

// function SelectItem({
//   className,
//   children,
//   ...props
// }: React.ComponentProps<typeof SelectPrimitive.Item>) {
//   return (
//     <SelectPrimitive.Item
//       data-slot="select-item"
//       className={cn(
//         "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
//         className,
//       )}
//       {...props}
//     >
//       <span className="absolute right-2 flex size-3.5 items-center justify-center">
//         <SelectPrimitive.ItemIndicator>
//           <CheckIcon className="size-4" />
//         </SelectPrimitive.ItemIndicator>
//       </span>
//       <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
//     </SelectPrimitive.Item>
//   );
// }

// function SelectSeparator({
//   className,
//   ...props
// }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
//   return (
//     <SelectPrimitive.Separator
//       data-slot="select-separator"
//       className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
//       {...props}
//     />
//   );
// }

// function SelectScrollUpButton({
//   className,
//   ...props
// }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
//   return (
//     <SelectPrimitive.ScrollUpButton
//       data-slot="select-scroll-up-button"
//       className={cn("flex cursor-default items-center justify-center py-1", className)}
//       {...props}
//     >
//       <ChevronUpIcon className="size-4" />
//     </SelectPrimitive.ScrollUpButton>
//   );
// }

// function SelectScrollDownButton({
//   className,
//   ...props
// }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
//   return (
//     <SelectPrimitive.ScrollDownButton
//       data-slot="select-scroll-down-button"
//       className={cn("flex cursor-default items-center justify-center py-1", className)}
//       {...props}
//     >
//       <ChevronDownIcon className="size-4" />
//     </SelectPrimitive.ScrollDownButton>
//   );
// }

// export {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectScrollDownButton,
//   SelectScrollUpButton,
//   SelectSeparator,
//   SelectTrigger,
//   SelectValue,
// };
