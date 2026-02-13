import { Input } from "@/components/ui/input";

export function BudgetDisplay({ budget }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 bg-slate-800 p-2 sm:p-1.5 rounded-lg border border-slate-700 max-w-full">
      <label className="text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap pl-1">Presupuesto diario:</label>
      <div className="w-20 sm:w-24">
        <Input
          type="number"
          value={budget}
          readOnly
          className="flex h-8 sm:h-9 w-full rounded-md border border-slate-700 text-xs sm:text-sm outline-none placeholder:text-slate-400 focus:border-sky-500 bg-slate-900 text-slate-200 px-2 py-1 text-center sm:text-left"
        />
      </div>
    </div>
  );
}
