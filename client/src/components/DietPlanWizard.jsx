import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Utensils, Flame, Pizza, IceCream, Beef, Fish, Leaf, MilkOff, NutOff, Wheat, ArrowRight, ArrowLeft } from "lucide-react";
import { MacroTable } from "@/components/MacroTable";
import { cn } from "@/lib/utils";

export function DietPlanWizard({ 
  open, 
  onOpenChange, 
  prefs, 
  setPrefs, 
  onGenerate, 
  plan, 
  onAccept, 
  onDecline,
  onRegenerate,
  onPlanChange
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    if (open) {
      setStep(1);
      setLoading(false);
    }
  }, [open]);

  // Clean incompatible preferences when restrictions change
  useEffect(() => {
    if (prefs.vegetarian) {
      setPrefs(p => ({ ...p, preferChicken: false, preferFish: false }));
    }
    if (prefs.noDairy) {
      setPrefs(p => {
        const cheats = (p.cheatMeals || []).filter(c => c !== 'helado');
        return { ...p, cheatMeals: cheats };
      });
    }
  }, [prefs.vegetarian, prefs.noDairy, setPrefs]);

  const handleGenerate = async () => {
    setLoading(true);
    setLoadingText("Analizando tus preferencias...");
    
    // Simulate steps for better UX
    setTimeout(() => setLoadingText("Calculando macros óptimos..."), 2000);
    setTimeout(() => setLoadingText("Buscando alimentos compatibles..."), 4500);
    setTimeout(() => setLoadingText("Armando tu plan personalizado..."), 7000);

    try {
      // Add artificial delay before starting the actual request to make it feel more "heavy"
      await new Promise(r => setTimeout(r, 1500));
      await onGenerate(prefs);
      // Wait to ensure the last message is seen
      await new Promise(r => setTimeout(r, 6000));
      setStep(4); // Preview step
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheat = (meal) => {
    const current = prefs.cheatMeals || [];
    const next = current.includes(meal) 
      ? current.filter(m => m !== meal)
      : [...current, meal];
    setPrefs({ ...prefs, cheatMeals: next });
  };

  const PreferenceCard = ({ active, onClick, icon: Icon, title, desc }) => (
    <div 
      onClick={onClick}
      className={cn(
        "cursor-pointer relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center h-32 group",
        active 
          ? "border-green-500 bg-slate-900/80 shadow-[0_0_20px_rgba(74,222,128,0.4)]" 
          : "border-slate-800 bg-slate-900/40 hover:border-green-500/50 hover:bg-slate-900/60"
      )}
    >
      <Icon className={cn("w-8 h-8 transition-colors", active ? "text-green-400" : "text-slate-400 group-hover:text-green-300")} />
      <div className="font-medium text-slate-200">{title}</div>
      {desc && <div className="text-xs text-slate-500">{desc}</div>}
      {active && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#4ade80]" />
        </div>
      )}
    </div>
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl min-h-[600px] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Close Button */}
        {!loading && (
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-slate-950 flex flex-col items-center justify-center gap-6"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-slate-800" />
                <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-green-500 border-t-transparent animate-spin shadow-[0_0_20px_rgba(74,222,128,0.3)]" />
                <Utensils className="absolute inset-0 m-auto w-8 h-8 text-green-500 animate-pulse" />
              </div>
              <motion.div 
                key={loadingText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-medium text-green-400 text-center px-4"
              >
                {loadingText}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steps Content */}
        <div className="flex-1 p-6 md:p-8 flex flex-col">
          {!loading && step < 4 && (
            <>
              <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-green-500 shadow-[0_0_10px_rgba(74,222,128,0.5)]" : "bg-slate-800")} />
                ))}
              </div>

              <div className="flex-1">
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-3xl font-bold text-white text-center mb-2">Restricciones Dietéticas</h2>
                    <p className="text-slate-400 text-center mb-8">Selecciona si tienes alguna restricción alimentaria importante.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <PreferenceCard 
                        active={prefs.vegetarian} 
                        onClick={() => setPrefs({ ...prefs, vegetarian: !prefs.vegetarian })}
                        icon={Leaf} 
                        title="Vegetariano" 
                        desc="Sin carne ni pescado"
                      />
                      <PreferenceCard 
                        active={prefs.noDairy} 
                        onClick={() => setPrefs({ ...prefs, noDairy: !prefs.noDairy })}
                        icon={MilkOff} 
                        title="Sin Lácteos" 
                        desc="Intolerancia a la lactosa"
                      />
                      <PreferenceCard 
                        active={prefs.noNuts} 
                        onClick={() => setPrefs({ ...prefs, noNuts: !prefs.noNuts })}
                        icon={NutOff} 
                        title="Sin Frutos Secos" 
                        desc="Alergia a nueces/maní"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-3xl font-bold text-white text-center mb-2">Preferencias de Macros</h2>
                    <p className="text-slate-400 text-center mb-8">¿Qué fuentes de energía prefieres en tu dieta?</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <PreferenceCard 
                        active={prefs.preferRice} 
                        onClick={() => setPrefs({ ...prefs, preferRice: !prefs.preferRice })}
                        icon={Wheat} 
                        title="Arroz" 
                      />
                      <PreferenceCard 
                        active={prefs.preferPasta} 
                        onClick={() => setPrefs({ ...prefs, preferPasta: !prefs.preferPasta })}
                        icon={Utensils} 
                        title="Pasta" 
                      />
                      {!prefs.vegetarian && (
                        <>
                          <PreferenceCard 
                            active={prefs.preferChicken} 
                            onClick={() => setPrefs({ ...prefs, preferChicken: !prefs.preferChicken })}
                            icon={Utensils} 
                            title="Pollo" 
                          />
                          <PreferenceCard 
                            active={prefs.preferFish} 
                            onClick={() => setPrefs({ ...prefs, preferFish: !prefs.preferFish })}
                            icon={Fish} 
                            title="Pescado" 
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-3xl font-bold text-white text-center mb-2">Gustos Culpables (Cheat Meals)</h2>
                    <p className="text-slate-400 text-center mb-8">Selecciona qué te gustaría incluir ocasionalmente.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <PreferenceCard 
                        active={(prefs.cheatMeals || []).includes(prefs.vegetarian ? 'hamburguesa vegana' : 'hamburguesa')} 
                        onClick={() => toggleCheat(prefs.vegetarian ? 'hamburguesa vegana' : 'hamburguesa')}
                        icon={prefs.vegetarian ? Leaf : Beef} 
                        title={prefs.vegetarian ? "Hamburguesa Vegana" : "Hamburguesa"} 
                      />
                      <PreferenceCard 
                        active={(prefs.cheatMeals || []).includes('pizza')} 
                        onClick={() => toggleCheat('pizza')}
                        icon={Pizza} 
                        title="Pizza" 
                      />
                      {!prefs.noDairy && (
                        <PreferenceCard 
                          active={(prefs.cheatMeals || []).includes('helado')} 
                          onClick={() => toggleCheat('helado')}
                          icon={IceCream} 
                          title="Helado" 
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-8 pt-4 border-t border-slate-800">
                {step > 1 ? (
                  <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Anterior
                  </Button>
                ) : (
                  <div />
                )}
                
                {step < 3 ? (
                  <Button onClick={() => setStep(s => s + 1)} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    Siguiente <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={handleGenerate} className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-[0_0_15px_rgba(74,222,128,0.4)] hover:shadow-[0_0_25px_rgba(74,222,128,0.6)] transition-all">
                    <Flame className="w-4 h-4" /> Generar Plan Mágico
                  </Button>
                )}
              </div>
            </>
          )}

          {!loading && step === 4 && plan && (
            <div className="flex flex-col h-full animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">¡Tu Plan Personalizado!</h2>
                <p className="text-slate-400">Basado en tus objetivos y preferencias seleccionadas.</p>
                <div className="mt-4 inline-block bg-slate-900/50 border border-slate-800 rounded-lg px-6 py-3">
                   <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Total Calorías</div>
                   <div className="text-4xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">
                     {Math.round(plan.reduce((sum, item) => sum + (Number(item.calories) * (Number(item.qty) || 1) * (Number(item.grams) || 100) / 100), 0))} kcal
                   </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 bg-slate-900/30 rounded-xl border border-slate-800 p-4 mb-6">
                 <MacroTable 
                    foods={plan} 
                    onQtyChange={(index, nextQty) => {
                      const next = plan.map((f, i) => i === index ? { ...f, qty: nextQty } : f);
                      onPlanChange(next);
                    }} 
                    onGramsChange={(index, nextGrams) => {
                      const next = plan.map((f, i) => i === index ? { ...f, grams: nextGrams } : f);
                      onPlanChange(next);
                    }} 
                 />
              </div>

              <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-slate-800">
                <Button variant="outline" onClick={onDecline} className="border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300">
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button variant="secondary" onClick={handleGenerate} className="bg-slate-800 text-slate-300 hover:bg-slate-700">
                  <Loader2 className="w-4 h-4 mr-2" /> Regenerar
                </Button>
                <Button onClick={onAccept} className="bg-green-600 hover:bg-green-700 text-white px-8 shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] transition-all">
                  <Check className="w-4 h-4 mr-2" /> Aceptar Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
