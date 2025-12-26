import { Input } from "@/components/ui/input";

export function BudgetDisplay({ budget }) {
  return (
    <div className="flex items-center gap-3 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
      <label className="text-sm font-medium text-slate-300 whitespace-nowrap pl-1">Presupuesto diario:</label>
      <div className="w-24">
        <Input
          type="number"
          value={budget}
          readOnly
          className="flex h-9 w-full rounded-md border border-slate-700 text-sm outline-none placeholder:text-slate-400 focus:border-sky-500 bg-slate-900 text-slate-200 px-2 py-1"
        />
      </div>
    </div>
  );
}
