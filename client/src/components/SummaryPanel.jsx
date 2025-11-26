import { Button } from "@/components/ui/button";

export function SummaryPanel({ output, loading, onSave }) {
  if (!output) return null;
  const r = output.remaining;
  const abs = Math.abs(r);
  const isRed = r < 0 || r >= 500;
  const isGreen = abs <= 100 && r >= 0;
  const isYellow = !isRed && !isGreen;
  const bannerClass = isRed ? "bg-red-600 text-white" : isGreen ? "bg-green-600 text-white" : "bg-yellow-500 text-black";
  const bannerMsg = isRed
    ? (r < 0 ? "Te has pasado con la ingesta de las calorías" : "Faltan al menos 500 calorías; ajusta tu plan")
    : isGreen
    ? "Optimista: muy cerca del objetivo"
    : (r > 0 ? "Falta muy poco pero vas bien" : "Te has pasado muy poco, ajusta ligeramente");
  return (
    <div className="mt-4 p-4 border border-slate-700 rounded bg-slate-900 text-slate-200">
      <div className={"mb-2 p-2 rounded " + bannerClass}>
        <strong>{output.remaining}</strong> calorías · {bannerMsg}
      </div>
      <hr className="my-2" />
      <p>Presupuesto: {output.budget}</p>
      <p>Consumidas: {output.consumed}</p>
      <p>Ejercicio: {output.exercise}</p>
      <Button
        onClick={onSave}
        disabled={loading}
        className="mt-2 bg-purple-500 hover:bg-purple-600 text-white guardar"
      >
        {loading ? 'Guardando...' : 'Guardar Resumen'}
      </Button>
    </div>
  );
}
