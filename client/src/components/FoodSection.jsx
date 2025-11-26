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
            <li key={`${f.name}-${f.calories}-${i}`} className="flex flex-row items-center justify-start cursor-pointer bg-slate-900 text-slate-200 p-1 my-0.5 border text-xs sm:text-[10pt]">
              <span className="truncate pr-2">{f.name} ({f.calories} Cal)</span>
              <Button cursor="pointer" onClick={() => removeFood(i)} className="ml-auto h-7 px-2 text-xs eliminarcomida" variant="outline">Eliminar</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
