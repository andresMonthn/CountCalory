import { FoodCombobox } from "@/components/food/FoodCombobox";
import { Button } from "@/components/ui/button";

export function FoodSection({ foodList, onAdd, removeFood }) {
  return (
    <div className="mb-4 w-full">
      <p className="text-slate-400 text-sm mb-2 text-left">Busca y selecciona</p>
      <div className="w-full">
        <FoodCombobox onAdd={onAdd} disabled={false} className="min-w-full" />
      </div>
      {foodList.length > 0 && (
        <ul className="mt-1 text-left">
          {foodList.map((f, i) => (
            <li key={`${f.name}-${f.calories}-${i}`} className="flex flex-row items-center justify-start cursor-pointer bg-slate-900 text-slate-200 p-2 my-1 rounded-md text-sm shadow-sm border border-slate-800">
              <span className="truncate pr-2 flex-1 font-medium">{f.name} <span className="text-slate-400 text-xs">({f.calories} Cal)</span></span>
              <Button cursor="pointer" onClick={() => removeFood(i)} className="ml-2 h-9 px-3 text-xs bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-900/50" variant="outline">Eliminar</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
