import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Activity, Bike, Dumbbell, Zap } from "lucide-react";

export function ExerciseSection({ exerciseOptions, selectedExercises, setSelectedExercises, addExercise, exerciseList, removeExercise }) {
  return (
    <div className="ejercicio">
      <label>Ejercicio:</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-2">
        {exerciseOptions.map((opt, i) => {
          const checked = selectedExercises.some(se => se.name === opt.name && se.calories === opt.calories);
          const nameLower = opt.name.toLowerCase();
          const Icon = nameLower.includes("bicicleta") ? Bike : nameLower.includes("pesas") ? Dumbbell : Activity;
          return (
            <label
              key={`${opt.name}-${opt.calories}-${i}`}
              className={cn(
                "flex aspect-square flex-col items-center justify-between text-slate-100 p-2 rounded-xl border border-slate-700 cursor-pointer hover:brightness-110 bg-title-gradient",
                checked ? "ring-2 ring-sky-300 scale-[1.02]" : ""
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                className="sr-only"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedExercises([...selectedExercises, opt]);
                  } else {
                    setSelectedExercises(selectedExercises.filter(se => !(se.name === opt.name && se.calories === opt.calories)));
                  }
                }}
              />
              <Icon className="w-12 h-12 mx-auto" />
              <span className="text-white/90 bg-black/20 px-2 py-0.5 rounded text-[11px] sm:text-xs">{opt.calories} Cal</span>
              <span className="mt-auto truncate-2 text-center px-1 text-[11px] sm:text-xs font-black uppercase tracking-tight">{opt.name}</span>
            </label>
          );
        })}
      </div>
      <Button onClick={addExercise} className="bg-green-500 hover:bg-green-600 text-white agregarejercicio">
        Agregar ejercicio
      </Button>
      {exerciseList.length > 0 && (
        <ul className="mt-2">
          {exerciseList.map((e, i) => (
            <li key={`${e.name}-${e.calories}-${i}`} className="flex justify-between items-center bg-slate-900 text-slate-200 p-2 my-1 rounded">
              {e.name} ({e.calories} Cal)
              <Button onClick={() => removeExercise(i)} className="ml-2 eliminarejercicio" variant="outline">Eliminar</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
