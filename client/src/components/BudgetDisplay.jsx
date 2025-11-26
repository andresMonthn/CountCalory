import { Input } from "@/components/ui/input";

export function BudgetDisplay({ budget }) {
  return (
    <>
      <label>Presupuesto diario:</label>
      <Input
        type="number"
        value={budget}
        readOnly
        className="bg-slate-900 text-slate-200 px-2 py-1"
      />
    </>
  );
}
