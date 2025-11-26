import { Mars, Venus, Target, Ruler, Weight, Activity, Calendar } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BudgetDisplay } from "@/components/BudgetDisplay";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export function ProfilePanel({ gender, setGender, heightCm, setHeightCm, weightKg, setWeightKg, ageYears, setAgeYears, activity, setActivity, goal, setGoal, budget, onGeneratePlan, mealsCount, setMealsCount }) {
  const [prefOpen, setPrefOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    vegetarian: false,
    noDairy: false,
    noNuts: false,
    preferRice: true,
    preferPasta: false,
    preferChicken: true,
    preferFish: false,
  });
  return (
    <div className="mb-4 w-full max-w-[960px] p-3 rounded border border-slate-700 bg-slate-900 text-slate-200">
      <div className="flex gap-2 mb-2">
        <Button
          className={"flex items-center gap-1 " + (gender === "male" ? "bg-sky-700 border-sky-600 text-white" : "bg-slate-800 border-slate-700 text-slate-200")}
          variant={gender === "male" ? "default" : "outline"}
          onClick={() => setGender("male")}
        >
          <Mars size={16} /> Hombre
        </Button>
        <Button
          className={"flex items-center gap-1 " + (gender === "female" ? "bg-sky-700 border-sky-600 text-white" : "bg-slate-800 border-slate-700 text-slate-200")}
          variant={gender === "female" ? "default" : "outline"}
          onClick={() => setGender("female")}
        >
          <Venus size={16} /> Mujer
        </Button>
        <div className="ml-auto flex items-end justify-end">
          <BudgetDisplay budget={budget} />
        </div>
        
      </div>
      <div className="flex mb-2">
        <Popover open={prefOpen} onOpenChange={setPrefOpen}>
          <PopoverTrigger asChild>
            <Button className="ml-auto bg-green-600 hover:bg-green-700 text-white">
              Generar Plan Alimentario
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" sideOffset={8} className="w-[320px]">
            <div className="flex flex-col gap-2 text-sm">
              <div className="font-semibold">Preferencias alimentarias</div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={prefs.vegetarian} onChange={(e) => setPrefs({ ...prefs, vegetarian: e.target.checked })} />
                <span>Vegetariano</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={prefs.noDairy} onChange={(e) => setPrefs({ ...prefs, noDairy: e.target.checked })} />
                <span>Sin lácteos</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={prefs.noNuts} onChange={(e) => setPrefs({ ...prefs, noNuts: e.target.checked })} />
                <span>Sin frutos secos</span>
              </label>
              <hr className="my-1 border-slate-700" />
              <div className="font-semibold">Preferencias de macros</div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={prefs.preferRice} onChange={(e) => setPrefs({ ...prefs, preferRice: e.target.checked })} />
                <span>Preferir arroz</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={prefs.preferPasta} onChange={(e) => setPrefs({ ...prefs, preferPasta: e.target.checked })} />
                <span>Preferir pasta</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={prefs.preferChicken} onChange={(e) => setPrefs({ ...prefs, preferChicken: e.target.checked })} />
                <span>Preferir pollo</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={prefs.preferFish} onChange={(e) => setPrefs({ ...prefs, preferFish: e.target.checked })} />
                <span>Preferir pescado</span>
              </label>
              <div className="flex gap-2 mt-2">
                <Button className="bg-slate-700 text-white" variant="secondary" onClick={() => setPrefOpen(false)}>Cancelar</Button>
                <Button className="ml-auto bg-green-600 hover:bg-green-700 text-white" onClick={() => { onGeneratePlan?.(prefs); setPrefOpen(false); }}>Generar</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-2">
        <label className="flex flex-col bg-slate-800 p-2 rounded border border-slate-700">
          <div className="flex items-center gap-2">
            <Ruler size={16} />
            <Input type="number" className="w-full" value={heightCm} min={50} max={200} onChange={(e) => setHeightCm(e.target.value === "" ? NaN : Number(e.target.value))} placeholder="Altura (cm)" />
          </div>
          {Number.isFinite(heightCm) && (heightCm < 50 || heightCm > 200) && (
            <div className="mt-1 text-xs text-red-500">Altura fuera de rango (50–200 cm)</div>
          )}
        </label>
        <label className="flex items-center gap-2 bg-slate-800 p-2 rounded border border-slate-700">
          <span className="text-sm">Comidas</span>
          <select className="w-full h-9 rounded-md border border-slate-700 bg-slate-900/60 text-slate-200 px-2" value={mealsCount} onChange={(e) => setMealsCount(Number(e.target.value))}>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </label>
        <label className="flex flex-col bg-slate-800 p-2 rounded border border-slate-700">
          <div className="flex items-center gap-2">
            <Weight size={16} />
            <Input type="number" className="w-full" value={weightKg} min={2} max={200} onChange={(e) => setWeightKg(e.target.value === "" ? NaN : Number(e.target.value))} placeholder="Peso (kg)" />
          </div>
          {Number.isFinite(weightKg) && weightKg > 0 && (
            <div className="mt-1 text-xs text-slate-400">Peso seleccionado: {weightKg} kg</div>
          )}
          {Number.isFinite(weightKg) && weightKg < 2 && (
            <div className="mt-1 text-xs text-red-500">Peso fuera de rango (≥ 2 kg)</div>
          )}
        </label>
        <label className="flex flex-col bg-slate-800 p-2 rounded border border-slate-700">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <Input type="number" className="w-full" value={ageYears} min={12} max={121} onChange={(e) => setAgeYears(e.target.value === "" ? NaN : Number(e.target.value))} placeholder="Edad (años)" />
          </div>
          {Number.isFinite(ageYears) && ageYears > 0 && (
            <div className="mt-1 text-xs text-slate-400">Edad seleccionada: {ageYears} años</div>
          )}
          {Number.isFinite(ageYears) && ageYears > 121 && (
            <div className="mt-1 text-xs text-red-500">Edad fuera de rango (≤ 121 años)</div>
          )}
        </label>
        <label className="flex items-center gap-2 bg-slate-800 p-2 rounded border border-slate-700">
          <Activity size={16} />
          <select className="w-full h-9 rounded-md border border-slate-700 bg-slate-900/60 text-slate-200 px-2" value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option value="sedentario">Sedentario</option>
            <option value="ligero">Ligero</option>
            <option value="moderado">Moderado</option>
            <option value="intenso">Intenso</option>
          </select>
        </label>
      </div>
      <div className="flex gap-2 mb-2">
        <Button
          className={"flex items-center gap-1 " + (goal === "mantener" ? "bg-sky-700 border-sky-600 text-white" : "bg-slate-800 border-slate-700 text-slate-200")}
          variant={goal === "mantener" ? "default" : "outline"}
          onClick={() => setGoal("mantener")}
        >
          <Target size={16} /> Mantener
        </Button>
        <Button
          className={"flex items-center gap-1 " + (goal === "bajar" ? "bg-sky-700 border-sky-600 text-white" : "bg-slate-800 border-slate-700 text-slate-200")}
          variant={goal === "bajar" ? "default" : "outline"}
          onClick={() => setGoal("bajar")}
        >
          <Target size={16} /> Bajar
        </Button>
        <Button
          className={"flex items-center gap-1 " + (goal === "subir" ? "bg-sky-700 border-sky-600 text-white" : "bg-slate-800 border-slate-700 text-slate-200")}
          variant={goal === "subir" ? "default" : "outline"}
          onClick={() => setGoal("subir")}
        >
          <Target size={16} /> Subir
        </Button>       
      </div>
     
    </div>
  );
}
