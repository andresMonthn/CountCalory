import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";

export function Command({ className, ...props }) {
  return (
    <CommandPrimitive
      className={cn(
        "flex flex-col h-60 w-full rounded-md border border-slate-700 bg-slate-900 text-slate-200",
        className
      )}
      {...props}
    />
  );
}

export const CommandInput = React.forwardRef(function CommandInput(
  { className, value, onValueChange, onChange, ...props },
  ref
) {
  return (
    <CommandPrimitive.Input
      ref={ref}
      value={value}
      onValueChange={onValueChange}
      onChange={onValueChange ? (e) => onValueChange(e.target.value) : onChange}
      className={cn(
        "h-10 w-full bg-transparent px-3 text-sm outline-none placeholder:text-slate-400",
        className
      )}
      {...props}
    />
  );
});

export const CommandList = CommandPrimitive.List;
export const CommandEmpty = CommandPrimitive.Empty;
export const CommandGroup = CommandPrimitive.Group;
export const CommandItem = CommandPrimitive.Item;
