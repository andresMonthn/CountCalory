import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export function PopoverContent({ className, side = "bottom", align = "start", sideOffset = 8, ...props }) {
  return (
    <PopoverPrimitive.Content
      side={side}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 rounded-md border border-slate-700 bg-slate-900 text-slate-200 p-2 shadow-lg outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        className
      )}
      {...props}
    />
  );
}
