const STEPS = [25, 50, 100, 125, 150];
const perGram = { carbs: 4, proteina: 4, grasas: 9 };

const LOCAL_FOODS = [
  { name: "Arroz blanco", calories: 130, carbsG: 28, proteinaG: 2.7, grasasG: 0.3 },
  { name: "Pasta cocida", calories: 131, carbsG: 25, proteinaG: 5, grasasG: 1.1 },
  { name: "Pan integral", calories: 247, carbsG: 41, proteinaG: 13, grasasG: 4.2 },
  { name: "Avena", calories: 389, carbsG: 66, proteinaG: 17, grasasG: 7 },
  { name: "Patata cocida", calories: 86, carbsG: 20, proteinaG: 1.7, grasasG: 0.1 },
  { name: "Pechuga de pollo", calories: 165, carbsG: 0, proteinaG: 31, grasasG: 3.6 },
  { name: "Pavo", calories: 135, carbsG: 0, proteinaG: 29, grasasG: 1 },
  { name: "Huevo", calories: 143, carbsG: 1.1, proteinaG: 13, grasasG: 9.5 },
  { name: "Atún", calories: 132, carbsG: 0, proteinaG: 29, grasasG: 0.6 },
  { name: "Lentejas cocidas", calories: 116, carbsG: 20, proteinaG: 9, grasasG: 0.4 },
  { name: "Yogur natural", calories: 61, carbsG: 4.7, proteinaG: 3.5, grasasG: 3.3 },
  { name: "Aguacate", calories: 160, carbsG: 9, proteinaG: 2, grasasG: 15 },
  { name: "Almendras", calories: 579, carbsG: 22, proteinaG: 21, grasasG: 50 },
  { name: "Nueces", calories: 654, carbsG: 14, proteinaG: 15, grasasG: 65 },
  { name: "Aceite de oliva", calories: 884, carbsG: 0, proteinaG: 0, grasasG: 100 },
  { name: "Queso cheddar", calories: 403, carbsG: 1.3, proteinaG: 25, grasasG: 33 },
];

function nearestStep(value) {
  let best = STEPS[0];
  let bestDiff = Math.abs(value - best);
  for (const s of STEPS) {
    const d = Math.abs(value - s);
    if (d < bestDiff) { best = s; bestDiff = d; }
  }
  return Math.max(25, Math.min(150, best));
}

function macroRatios(goal) {
  if (goal === "bajar") return { carbs: 0.4, proteina: 0.35, grasas: 0.25 };
  if (goal === "subir") return { carbs: 0.5, proteina: 0.3, grasas: 0.2 };
  return { carbs: 0.5, proteina: 0.25, grasas: 0.25 };
}

async function fetchFoodsFromApi(terms, limit = 50) {
  const out = [];
  const seen = new Set();
  for (const t of terms) {
    try {
      const api = import.meta.env.VITE_API_URL + `/foods/search`;
      const res = await axios.get(api, {
        params: { q: t, limit },
        headers: { 'Accept': 'application/json' }
      });
      const data = res.data;
      const items = Array.isArray(data.items) ? data.items : [];
      for (const p of items) {
        const key = p._id || p.name;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          id: p._id,
          name: p.name,
          calories: p.calories,
          carbsG: p.carbsG ?? 0,
          proteinaG: p.proteinaG ?? 0,
          grasasG: p.grasasG ?? 0,
        });
      }
    } catch {}
  }
  return out;
}

function pickCandidates(list, macroKey, targetGramsPerMeal, preferredTokens = []) {
  const per100 = (f) => macroKey === 'carbs' ? f.carbsG : macroKey === 'proteina' ? f.proteinaG : f.grasasG;
  const scored = list
    .filter((f) => (per100(f) || 0) > 0)
    .map((f) => {
      const gramsNeeded = (targetGramsPerMeal / per100(f)) * 100;
      const gNearest = nearestStep(gramsNeeded);
      const diff = Math.abs(gNearest - gramsNeeded);
      const name = f.name?.toLowerCase() || "";
      const isPreferred = preferredTokens.some(tok => name.includes(tok));
      const score = diff + (isPreferred ? -0.75 : 0);
      return { f, grams: gNearest, diff: score, pref: isPreferred };
    })
    .sort((a, b) => a.diff - b.diff);
  return scored;
}

function applyPreferences(pool, preferences = {}) {
  const excludeTokens = [];
  if (preferences.vegetarian) excludeTokens.push("pollo", "pavo", "cerdo", "res", "carne", "atun", "pescado");
  if (preferences.noDairy) excludeTokens.push("yogur", "queso", "leche");
  if (preferences.noNuts) excludeTokens.push("almendra", "nuez", "cacahuate", "maní");
  let list = pool.filter(f => !excludeTokens.some(tok => f.name.toLowerCase().includes(tok)));
  const preferred = [];
  if (preferences.preferRice) preferred.push("arroz");
  if (preferences.preferPasta) preferred.push("pasta");
  if (preferences.preferChicken) preferred.push("pollo");
  if (preferences.preferFish) preferred.push("atun", "pescado");
  return { list, preferred };
}

export async function generateBalancedPlan({ budget, goal, mealsCount = 3, preferences = {}, exercise = 0, currentConsumed = 0 }) {
  const ratios = macroRatios(goal);
  const targetTotal = Math.max(0, (Number(budget) || 0) + (Number(exercise) || 0) - (Number(currentConsumed) || 0));
  const targetsCals = {
    carbs: targetTotal * ratios.carbs,
    proteina: targetTotal * ratios.proteina,
    grasas: targetTotal * ratios.grasas,
  };
  const targetsGrams = {
    carbs: targetsCals.carbs / perGram.carbs,
    proteina: targetsCals.proteina / perGram.proteina,
    grasas: targetsCals.grasas / perGram.grasas,
  };

  const terms = {
    carbs: ["arroz", "pasta", "pan", "avena", "patata"],
    proteina: ["pollo", "pavo", "huevo", "atun", "lentejas", "yogur"],
    grasas: ["aguacate", "almendra", "nuez", "aceite", "queso"],
  };

  const BROAD_TERMS = ["a", "e", "i", "o", "u", "ra", "pa", "po", "le", "yo", "nu", "av", "al"];
  const apiFoods = await fetchFoodsFromApi([...terms.carbs, ...terms.proteina, ...terms.grasas, ...BROAD_TERMS]);
  const basePool = apiFoods.length ? apiFoods : LOCAL_FOODS;
  const { list: pool, preferred } = applyPreferences(basePool, preferences);

  const usedGlobal = new Set();
  const items = [];
  for (let mealIndex = 1; mealIndex <= mealsCount; mealIndex++) {
    const usedMeal = new Set();
    for (const key of ["carbs", "proteina", "grasas"]) {
      const targetPerMeal = targetsGrams[key] / mealsCount;
      let candidates = pickCandidates(pool, key, targetPerMeal, preferred).filter(({ f }) => !usedGlobal.has(f.name) && !usedMeal.has(f.name));
      const top = candidates.slice(0, 6);
      const chosen = top.length ? top[Math.floor(Math.random() * top.length)] : null;
      const chosenFood = chosen?.f || pool.find(f => !used.has(f.name)) || pool[0];
      const grams = chosen?.grams ?? nearestStep(100);
      usedMeal.add(chosenFood.name);
      usedGlobal.add(chosenFood.name);
      items.push({
        name: chosenFood.name,
        calories: chosenFood.calories,
        carbsG: chosenFood.carbsG,
        proteinaG: chosenFood.proteinaG,
        grasasG: chosenFood.grasasG,
        qty: 1,
        grams,
        mealIndex,
      });
    }
  }
  const plannedCals = items.reduce((sum, it) => sum + Number(it.calories || 0) * (Number(it.grams || 100) / 100) * (Number(it.qty || 1)), 0);
  if (plannedCals > 0 && targetTotal > 0) {
    const scale = targetTotal / plannedCals;
    for (const it of items) {
      const g = Number(it.grams || 100);
      const nextG = nearestStep(Math.max(25, Math.min(150, g * scale)));
      it.grams = nextG;
    }
    const recalced = items.reduce((sum, it) => sum + Number(it.calories || 0) * (Number(it.grams || 100) / 100) * (Number(it.qty || 1)), 0);
    const delta = targetTotal - recalced;
    if (Math.abs(delta) >= 100) {
      const dir = delta > 0 ? 1 : -1;
      let idx = items.reduce((bestIdx, it, i) => {
        const dens = Number(it.calories || 0);
        return (bestIdx === -1 || (dir > 0 ? dens > Number(items[bestIdx].calories || 0) : dens < Number(items[bestIdx].calories || 0))) ? i : bestIdx;
      }, -1);
      if (idx >= 0) {
        const g = Number(items[idx].grams || 100);
        const step = dir > 0 ? Math.min(150, g + 25) : Math.max(25, g - 25);
        items[idx].grams = nearestStep(step);
      }
    }
  }
  return items;
}
