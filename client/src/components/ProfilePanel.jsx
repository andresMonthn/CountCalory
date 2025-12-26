import { Mars, Venus, Target, Ruler, Weight, Activity, Calendar, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SimpleSelect } from "@/components/ui/simple-select";
import { BudgetDisplay } from "@/components/BudgetDisplay";

export function ProfilePanel({ gender, setGender, heightCm, setHeightCm, weightKg, setWeightKg, ageYears, setAgeYears, activity, setActivity, goal, setGoal, budget, mealsCount, setMealsCount, onSaveProfile }) {
  return (
    <Card className="w-full max-w-[1024px] mx-auto bg-slate-950 border-slate-800 shadow-2xl">
      <CardHeader className="pb-4 border-b border-slate-800/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4 w-full md:w-auto">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                Mi Perfil
              </CardTitle>
              
              {/* Gender Toggle */}
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setGender("male")} 
                    className={`h-8 px-3 rounded-md transition-all ${gender === "male" ? "bg-sky-500/10 text-sky-400 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
                 >
                    <Mars size={14} className="mr-2"/> Hombre
                 </Button>
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setGender("female")} 
                    className={`h-8 px-3 rounded-md transition-all ${gender === "female" ? "bg-pink-500/10 text-pink-400 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
                 >
                    <Venus size={14} className="mr-2"/> Mujer
                 </Button>
              </div>
           </div>

           <div className="flex gap-3 items-center w-full md:w-auto justify-end">
              <BudgetDisplay budget={budget} />
              <Button onClick={onSaveProfile} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 transition-all active:scale-95">
                  <Save size={16} className="mr-2" /> Guardar
              </Button>
           </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        {/* Biometrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
           {/* Height */}
           <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Ruler size={12} className="text-emerald-500"/> Altura
              </Label>
              <div className="relative group">
                <Input 
                    type="number" 
                    value={heightCm} 
                    onChange={(e) => setHeightCm(e.target.value === "" ? NaN : Number(e.target.value))}
                    min={50}
                    max={250}
                    className="bg-slate-900/50 border-slate-800 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 text-slate-200 pl-3 pr-8 transition-all"
                    placeholder="170"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-medium">cm</span>
              </div>
           </div>

           {/* Weight */}
           <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Weight size={12} className="text-emerald-500"/> Peso
              </Label>
              <div className="relative group">
                <Input 
                    type="number" 
                    value={weightKg} 
                    onChange={(e) => setWeightKg(e.target.value === "" ? NaN : Number(e.target.value))}
                    min={2}
                    max={300}
                    className="bg-slate-900/50 border-slate-800 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 text-slate-200 pl-3 pr-8 transition-all"
                    placeholder="70"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-medium">kg</span>
              </div>
           </div>

           {/* Age */}
           <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={12} className="text-emerald-500"/> Edad
              </Label>
              <div className="relative group">
                <Input 
                    type="number" 
                    value={ageYears} 
                    onChange={(e) => setAgeYears(e.target.value === "" ? NaN : Number(e.target.value))}
                    min={12}
                    max={120}
                    className="bg-slate-900/50 border-slate-800 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 text-slate-200 pl-3 pr-12 transition-all"
                    placeholder="30"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-medium">años</span>
              </div>
           </div>

           {/* Activity */}
           <div className="space-y-2 col-span-2 md:col-span-3 lg:col-span-1">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Activity size={12} className="text-emerald-500"/> Actividad
              </Label>
              <SimpleSelect 
                 value={activity} 
                 onChange={(e) => setActivity(e.target.value)}
                 className="bg-slate-900/50 border-slate-800 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-200 transition-all cursor-pointer"
              >
                 <option value="sedentario">Sedentario (Poco ejercicio)</option>
                 <option value="ligero">Ligero (1-3 días/sem)</option>
                 <option value="moderado">Moderado (3-5 días/sem)</option>
                 <option value="intenso">Intenso (6-7 días/sem)</option>
              </SimpleSelect>
           </div>

           {/* Meals */}
           <div className="space-y-2 col-span-2 md:col-span-3 lg:col-span-1">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Comidas
              </Label>
              <SimpleSelect 
                 value={mealsCount} 
                 onChange={(e) => setMealsCount(Number(e.target.value))}
                 className="bg-slate-900/50 border-slate-800 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-200 transition-all cursor-pointer"
              >
                 <option value={3}>3 Comidas / día</option>
                 <option value={4}>4 Comidas / día</option>
                 <option value={5}>5 Comidas / día</option>
              </SimpleSelect>
           </div>
        </div>

        {/* Goal Section */}
        <div className="space-y-4">
            <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Objetivo Nutricional</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               <Button 
                  variant="outline"
                  onClick={() => setGoal('bajar')}
                  className={`h-auto py-3 justify-start border bg-slate-900/30 ${goal === 'bajar' ? 'border-amber-500/50 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400' : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
               >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${goal === 'bajar' ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                        <Target size={18} className="rotate-180"/>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-semibold">Bajar Peso</span>
                        <span className="text-[10px] opacity-70">Déficit calórico</span>
                    </div>
                  </div>
               </Button>

               <Button 
                  variant="outline"
                  onClick={() => setGoal('mantener')}
                  className={`h-auto py-3 justify-start border bg-slate-900/30 ${goal === 'mantener' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-400' : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
               >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${goal === 'mantener' ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
                        <Target size={18} />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-semibold">Mantener</span>
                        <span className="text-[10px] opacity-70">Balance calórico</span>
                    </div>
                  </div>
               </Button>

               <Button 
                  variant="outline"
                  onClick={() => setGoal('subir')}
                  className={`h-auto py-3 justify-start border bg-slate-900/30 ${goal === 'subir' ? 'border-sky-500/50 bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 hover:text-sky-400' : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
               >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${goal === 'subir' ? 'bg-sky-500/20' : 'bg-slate-800'}`}>
                        <Target size={18} />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-semibold">Subir Peso</span>
                        <span className="text-[10px] opacity-70">Superávit calórico</span>
                    </div>
                  </div>
               </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
