import '@/styles/app.css'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NavigationBar } from "@/components/NavigationBar";
import { Header } from "@/components/Header";
import { ProfilePanel } from "@/components/ProfilePanel";
import { FoodSection } from "@/components/FoodSection";
import { ExerciseSection } from "@/components/ExerciseSection";
import { SummaryPanel } from "@/components/SummaryPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { MacroTable } from "@/components/MacroTable";
import { BudgetDisplay } from "@/components/BudgetDisplay";
import { computeBudget } from "@/utils/budget";
import { useOnline } from "@/hooks/useOnline";
import { useHistoryPolling } from "@/hooks/useHistoryPolling";
import { saveSummaryData } from "@/services/summaryService";
import { generateBalancedPlan } from "@/services/planService";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { SetPasswordDialog } from "@/components/SetPasswordDialog";

const exerciseOptions = [
  { name: "Caminata ligera 30 min", calories: 100 },
  { name: "Correr 30 min", calories: 300 },
  { name: "Bicicleta 30 min", calories: 250 },
  { name: "Natación 30 min", calories: 200 },
  { name: "Yoga 30 min", calories: 120 },
  { name: "Pesas 1hra", calories: 540 },
];

export default function CalculatorApp() {
  const [currentView, setCurrentView] = useState("home");
  const [budget, setBudget] = useState(2000);
  const [gender, setGender] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [goal, setGoal] = useState("mantener");
  const [activity, setActivity] = useState("");
  const [mealsCount, setMealsCount] = useState(3);
  const [prefOpen, setPrefOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPlan, setPreviewPlan] = useState([]);
  const [prefs, setPrefs] = useState({
    vegetarian: false,
    noDairy: false,
    noNuts: false,
    preferRice: true,
    preferPasta: false,
    preferChicken: true,
    preferFish: false,
  });
  const [lastPrefs, setLastPrefs] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [foodList, setFoodList] = useState([]);
  const [exerciseList, setExerciseList] = useState([]);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const isOnline = useOnline();
  const { history, refresh } = useHistoryPolling(isOnline);
  const { user, logout, updateUser } = useAuth();

  // Load user profile data on mount
  useEffect(() => {
    if (user) {
        console.log('👤 Applying user profile to calculator:', user);
        
        // Ensure we only update if values exist and are valid
        if (user.weight && !isNaN(user.weight)) setWeightKg(user.weight);
        if (user.height && !isNaN(user.height)) setHeightCm(user.height);
        if (user.age && !isNaN(user.age)) setAgeYears(user.age);
        if (user.activityLevel) setActivity(user.activityLevel);
        // Note: gender and goal might be added to the user model later if needed
    }
  }, [user]);

  const saveProfile = async () => {
    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        const { data } = await axios.put(`${apiUrl}/auth/profile`, {
            weight: weightKg,
            height: heightCm,
            age: ageYears,
            activityLevel: activity
        });
        updateUser(data);
        alert('✅ Perfil actualizado correctamente');
    } catch (error) {
        console.error('Error saving profile:', error);
        const msg = error.response?.data?.message || 'Error al guardar el perfil';
        alert(`❌ ${msg}`);
    }
  };

  const addExercise = () => {
    const uniques = selectedExercises.filter(sel => !exerciseList.some(e => e.name === sel.name && e.calories === sel.calories));
    if (uniques.length > 0) {
      setExerciseList([...exerciseList, ...uniques]);
    }
    setSelectedExercises([]);
  };
  const removeFood = (index) => setFoodList(foodList.filter((_, i) => i !== index));
  const removeExercise = (index) => setExerciseList(exerciseList.filter((_, i) => i !== index));

  const calculate = () => {
    const consumed = foodList.reduce((sum, f) => sum + f.calories * (Number(f.qty || 1)) * (Number(f.grams || 100) / 100), 0);
    const exercise = exerciseList.reduce((sum, e) => sum + e.calories, 0);
    const remaining = budget - consumed + exercise;
    setOutput({ budget, consumed, exercise, remaining, status: remaining < 0 ? "Surplus" : "Deficit" });
  };

  const saveSummary = async () => {
    if (!output) return;
    setLoading(true);
    try {
      await saveSummaryData({ ...output, createdAt: new Date().toISOString() });
      await refresh();
      alert("✅ Resumen guardado correctamente");
    } catch (err) {
      alert("❌ Error al guardar. Verifica la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async (preferences) => {
    const exerciseTotal = exerciseList.reduce((sum, e) => sum + e.calories, 0);
    const currentConsumed = 0;
    const planItems = await generateBalancedPlan({ budget, goal, mealsCount, preferences, exercise: exerciseTotal, currentConsumed });
    setPreviewPlan(planItems);
    setPreviewOpen(true);
    if (preferences) setLastPrefs(preferences);
  };

  const acceptPlan = () => {
    setFoodList(previewPlan);
    setPreviewOpen(false);
    setPreviewPlan([]);
  };

  const declinePlan = () => {
    setPreviewOpen(false);
    setPreviewPlan([]);
  };

  const regeneratePlan = async () => {
    const exerciseTotal = exerciseList.reduce((sum, e) => sum + e.calories, 0);
    const currentConsumed = 0;
    const planItems = await generateBalancedPlan({ budget, goal, mealsCount, preferences: lastPrefs || prefs, exercise: exerciseTotal, currentConsumed });
    setPreviewPlan(planItems);
  };

  useEffect(() => {
    const h = Number.isFinite(heightCm) ? heightCm : 170;
    const w = Number.isFinite(weightKg) ? weightKg : 70;
    const a = Number.isFinite(ageYears) ? ageYears : 30;
    const next = computeBudget(gender, h, w, goal, activity, a);
    setBudget(Math.round(next));
  }, [gender, heightCm, weightKg, ageYears, goal, activity]);

  function limpiar() {
    setFoodList([]);
    setExerciseList([]);
    setOutput(null);
    setBudget(2000);
  }

  return (
    <>
      <SetPasswordDialog />
      <NavigationBar currentView={currentView} onNavigate={setCurrentView} />
      <div className="pb-32 transition-all duration-300">
        <div className="max-w-[1024px] mx-auto px-3 sm:px-4">
          <Header />
          <div className="CalorieCounter">
            {currentView === "profile" && (
              <div className="animate-fade-in">
                <ProfilePanel
                  gender={gender}
                  setGender={setGender}
                  heightCm={heightCm}
                  setHeightCm={setHeightCm}
                  weightKg={weightKg}
                  setWeightKg={setWeightKg}
                  ageYears={ageYears}
                  setAgeYears={setAgeYears}
                  activity={activity}
                  setActivity={setActivity}
                  goal={goal}
                  setGoal={setGoal}
                  budget={budget}
                  onGeneratePlan={generatePlan}
                  onSaveProfile={saveProfile}
                  mealsCount={mealsCount}
                  setMealsCount={setMealsCount}
                />
              </div>
            )}

            {currentView === "home" && (
              <div className="animate-fade-in">
                <div className="flex justify-center mb-6">
                  <BudgetDisplay budget={budget} />
                </div>

                <div className="flex justify-center mb-6">
                  <Popover open={prefOpen} onOpenChange={setPrefOpen}>
                    <PopoverTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Generar Plan Alimentario
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="center" sideOffset={8} className="w-[320px]">
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
                          <Button className="ml-auto bg-green-600 hover:bg-green-700 text-white" onClick={() => { generatePlan(prefs); setPrefOpen(false); }}>Generar</Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex items-center justify-center w-full">
                  <FoodSection
                    foodList={foodList}
                    onAdd={(food) => setFoodList([...foodList, { ...food, qty: 1, grams: 100 }])}
                    removeFood={removeFood}
                  />
                </div>
                {foodList.length > 0 && (
                  <div className="flex items-center justify-center w-full">
                    <MacroTable
                      foods={foodList}
                      onQtyChange={(index, nextQty) => {
                        const next = foodList.map((f, i) => i === index ? { ...f, qty: nextQty } : f);
                        setFoodList(next);
                      }}
                      onGramsChange={(index, nextGrams) => {
                        const next = foodList.map((f, i) => i === index ? { ...f, grams: nextGrams } : f);
                        setFoodList(next);
                      }}
                    />
                  </div>
                )}
                <ExerciseSection
                  exerciseOptions={exerciseOptions}
                  selectedExercises={selectedExercises}
                  setSelectedExercises={setSelectedExercises}
                  addExercise={addExercise}
                  exerciseList={exerciseList}
                  removeExercise={removeExercise}
                />
                <Button onClick={calculate} className="calcular">Calcular resumen</Button>
                <Button onClick={limpiar} className="calcular" variant="secondary">Limpiar</Button>
                <SummaryPanel output={output} loading={loading} onSave={saveSummary} />
              </div>
            )}

            {currentView === "history" && (
              <div className="animate-fade-in">
                <HistoryPanel history={history} />
              </div>
            )}
          </div>
        </div>
      </div>
      <AlertDialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <AlertDialogContent className="w-[96%] max-w-[800px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Vista previa del plan alimentario</AlertDialogTitle>
            <AlertDialogDescription>
              Revisa el plan generado. Puedes ajustar las cantidades antes de aceptar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-2">
            <MacroTable
              foods={previewPlan}
              onQtyChange={(index, nextQty) => {
                const next = previewPlan.map((f, i) => i === index ? { ...f, qty: nextQty } : f);
                setPreviewPlan(next);
              }}
              onGramsChange={(index, nextGrams) => {
                const next = previewPlan.map((f, i) => i === index ? { ...f, grams: nextGrams } : f);
                setPreviewPlan(next);
              }}
            />
          </div>
          <AlertDialogFooter>
            <Button variant="outline" onClick={declinePlan}>Declinar</Button>
            <Button variant="secondary" onClick={regeneratePlan}>Volver a regenerar</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={acceptPlan}>Aceptar</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <SetPasswordDialog />
    </>
  );
}
