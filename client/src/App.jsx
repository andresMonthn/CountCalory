import '@/styles/app.css'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProfilePanel } from "@/components/ProfilePanel";
import { FoodSection } from "@/components/FoodSection";
import { ExerciseSection } from "@/components/ExerciseSection";
import { SummaryPanel } from "@/components/SummaryPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { MacroTable } from "@/components/MacroTable";
import { computeBudget } from "@/utils/budget";
import { useOnline } from "@/hooks/useOnline";
import { useHistoryPolling } from "@/hooks/useHistoryPolling";
import { saveSummaryData } from "@/services/summaryService";
import { generateBalancedPlan } from "@/services/planService";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";


const exerciseOptions = [
  { name: "Caminata ligera 30 min", calories: 100 },
  { name: "Correr 30 min", calories: 300 },
  { name: "Bicicleta 30 min", calories: 250 },
  { name: "Natación 30 min", calories: 200 },
  { name: "Yoga 30 min", calories: 120 },
  { name: "Pesas 1hra", calories: 540 },
];

export default function App() {
  const [budget, setBudget] = useState(2000);
  const [gender, setGender] = useState("male");
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [ageYears, setAgeYears] = useState(30);
  const [goal, setGoal] = useState("mantener");
  const [activity, setActivity] = useState("sedentario");
  const [mealsCount, setMealsCount] = useState(3);
  const [alertOpen, setAlertOpen] = useState(false);
  const [lastPrefs, setLastPrefs] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [foodList, setFoodList] = useState([]);
  const [exerciseList, setExerciseList] = useState([]);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const isOnline = useOnline();
  const { history, refresh } = useHistoryPolling(isOnline);

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
    setFoodList(planItems);
    if (preferences) setLastPrefs(preferences);
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
      <div className="max-w-[1024px] mx-auto px-3 sm:px-4">
        <Header />
        <div className="CalorieCounter">
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
            mealsCount={mealsCount}
            setMealsCount={setMealsCount}
          />
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
                onReachEnd={() => setAlertOpen(true)}
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
          <HistoryPanel history={history} />
        </div>
      </div>
      <Footer />
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Generar un nuevo plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Has llegado al final de la tabla. ¿Quieres crear otro plan con tus preferencias actuales?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setAlertOpen(false); generatePlan(lastPrefs); }}>Generar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
