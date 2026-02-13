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
import { DietPlanWizard } from "@/components/DietPlanWizard";
import { BuscadorAlimentos } from "@/components/BuscadorAlimentos";
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import axios from 'axios';
import { SetPasswordDialog } from "@/components/SetPasswordDialog";
import { API_URL } from '@/config/api';

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
  const [wizardOpen, setWizardOpen] = useState(false);
  const [previewPlan, setPreviewPlan] = useState([]);
  const [prefs, setPrefs] = useState({
    vegetarian: false,
    noDairy: false,
    noNuts: false,
    preferRice: true,
    preferPasta: false,
    preferChicken: true,
    preferFish: false,
    cheatMeals: [],
  });
  const [lastPrefs, setLastPrefs] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [foodList, setFoodList] = useState([]);
  const [exerciseList, setExerciseList] = useState([]);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const isOnline = useOnline();
  const { user, logout, updateUser } = useAuth();
  const { success, error: showError } = useAlert();
  const { history, refresh } = useHistoryPolling(isOnline && !!user);

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
        const apiUrl = API_URL;
        const { data } = await axios.put(`${apiUrl}/auth/profile`, {
            weight: weightKg,
            height: heightCm,
            age: ageYears,
            activityLevel: activity
        });
        updateUser(data);
        success('Perfil actualizado correctamente');
    } catch (error) {
        console.error('Error saving profile:', error);
        const msg = error.response?.data?.message || 'Error al guardar el perfil';
        showError(msg);
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
      success("Resumen guardado correctamente");
    } catch (err) {
      showError("Error al guardar. Verifica la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async (preferences) => {
    const exerciseTotal = exerciseList.reduce((sum, e) => sum + e.calories, 0);
    const currentConsumed = 0;
    const planItems = await generateBalancedPlan({ budget, goal, mealsCount, preferences, exercise: exerciseTotal, currentConsumed });
    setPreviewPlan(planItems);
    if (preferences) setLastPrefs(preferences);
    return planItems;
  };

  const acceptPlan = () => {
    setFoodList(previewPlan);
    setWizardOpen(false);
    setPreviewPlan([]);
  };

  const declinePlan = () => {
    setWizardOpen(false);
    setPreviewPlan([]);
  };

  const regeneratePlan = async () => {
    const exerciseTotal = exerciseList.reduce((sum, e) => sum + e.calories, 0);
    const currentConsumed = 0;
    const planItems = await generateBalancedPlan({ budget, goal, mealsCount, preferences: lastPrefs || prefs, exercise: exerciseTotal, currentConsumed });
    setPreviewPlan(planItems);
    return planItems;
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
      <div className="pt-12 pb-32 transition-all duration-300">
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
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white shadow-[0_0_10px_rgba(74,222,128,0.4)] hover:shadow-[0_0_20px_rgba(74,222,128,0.6)] transition-all duration-300"
                    onClick={() => setWizardOpen(true)}
                  >
                    Generar Plan Alimentario
                  </Button>
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
                <div className="flex justify-center gap-4 mt-6">
                  <Button onClick={calculate} className="calcular">Calcular resumen</Button>
                  <Button onClick={limpiar} className="calcular" variant="secondary">Limpiar</Button>
                </div>
                <SummaryPanel output={output} loading={loading} onSave={saveSummary} />
              </div>
            )}

            {currentView === "search" && (
              <div className="animate-fade-in">
                <BuscadorAlimentos />
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
      <DietPlanWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        prefs={prefs}
        setPrefs={setPrefs}
        onGenerate={generatePlan}
        plan={previewPlan}
        onAccept={acceptPlan}
        onDecline={declinePlan}
        onRegenerate={regeneratePlan}
        onPlanChange={setPreviewPlan}
      />
      <SetPasswordDialog />
    </>
  );
}
