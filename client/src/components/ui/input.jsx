import { cn } from "@/lib/utils";

export function Input({ className, type = "text", value, ...props }) {
  const normalizedValue =
    value === undefined || value === null || (typeof value === 'number' && Number.isNaN(value))
      ? ""
      : value;
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1 text-sm text-slate-200 outline-none placeholder:text-slate-400 focus:border-sky-500",
        className
      )}
      value={normalizedValue}
      {...props}
    />
  );
}
