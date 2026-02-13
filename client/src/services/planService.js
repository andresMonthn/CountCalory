import axios from 'axios';
import { API_URL } from '../config/api';

// Generar pasos de 10g en 10g desde 20g hasta 500g para mayor precisión
const STEPS = Array.from({ length: 49 }, (_, i) => (i + 2) * 10); 
const perGram = { carbs: 4, proteina: 4, grasas: 9 };

function nearestStep(value) {
  let best = STEPS[0];
  let bestDiff = Math.abs(value - best);
  for (const s of STEPS) {
    const d = Math.abs(value - s);
    if (d < bestDiff) { best = s; bestDiff = d; }
  }
  return Math.max(20, Math.min(500, best));
}

function macroRatios(goal) {
  if (goal === "bajar") return { carbs: 0.4, proteina: 0.4, grasas: 0.2 }; // Más proteína para saciedad
  if (goal === "subir") return { carbs: 0.5, proteina: 0.3, grasas: 0.2 };
  return { carbs: 0.45, proteina: 0.3, grasas: 0.25 };
}

async function fetchFoodsFromApi(terms, limit = 50) {
  const out = [];
  const seen = new Set();
  
  // Mezclar términos para variedad en cada llamada si hay muchos
  const shuffledTerms = terms.sort(() => 0.5 - Math.random());

  for (const t of shuffledTerms) {
    try {
      const api = API_URL + `/foods/search`;
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
        // Validar que tenga datos mínimos
        if (!p.calories || p.calories < 1) continue;
        
        out.push({
          id: p._id,
          name: p.name,
          calories: Number(p.calories),
          carbsG: Number(p.carbsG ?? 0),
          proteinaG: Number(p.proteinaG ?? 0),
          grasasG: Number(p.grasasG ?? 0),
        });
      }
    } catch (e) {
      console.error(`Error fetching term ${t}:`, e);
    }
  }
  return out;
}

function pickCandidates(list, macroKey, targetGramsPerMeal, preferredTokens = []) {
  const per100 = (f) => macroKey === 'carbs' ? f.carbsG : macroKey === 'proteina' ? f.proteinaG : f.grasasG;
  
  const scored = list
    .filter((f) => (per100(f) || 0) > 1) // Filtrar alimentos con muy poco del macro deseado
    .map((f) => {
      const density = per100(f);
      const gramsNeeded = (targetGramsPerMeal / density) * 100;
      
      // Penalizar porciones extremas (muy pequeñas o gigantes)
      let sizePenalty = 0;
      if (gramsNeeded < 30) sizePenalty = 20; 
      if (gramsNeeded > 400) sizePenalty = 20;

      const gNearest = nearestStep(gramsNeeded);
      const diff = Math.abs(gNearest - gramsNeeded);
      const name = f.name?.toLowerCase() || "";
      const isPreferred = preferredTokens.some(tok => name.includes(tok));
      
      // Score: menor es mejor
      // diff: error en gramos vs target
      // isPreferred: bonificación grande (-50)
      // Random: factor aleatorio para variedad (0-10)
      const randomFactor = Math.random() * 10;
      const score = diff + sizePenalty + (isPreferred ? -50 : 0) + randomFactor;
      
      return { f, grams: gNearest, score, pref: isPreferred };
    })
    .sort((a, b) => a.score - b.score);
    
  return scored;
}

function applyPreferences(pool, preferences = {}) {
  const excludeTokens = [];
  if (preferences.vegetarian) excludeTokens.push("pollo", "pavo", "cerdo", "res", "carne", "atun", "pescado", "salmon", "bistec", "jamon", "tocino");
  if (preferences.noDairy) excludeTokens.push("yogur", "queso", "leche", "crema", "mantequilla");
  if (preferences.noNuts) excludeTokens.push("almendra", "nuez", "cacahuate", "maní", "pistache", "avellana");
  
  let list = pool.filter(f => {
    const name = f.name.toLowerCase();
    return !excludeTokens.some(tok => name.includes(tok));
  });

  const preferred = [];
  if (preferences.preferRice) preferred.push("arroz");
  if (preferences.preferPasta) preferred.push("pasta");
  if (preferences.preferChicken) preferred.push("pollo");
  if (preferences.preferFish) preferred.push("atun", "pescado", "salmon");
  
  if (preferences.cheatMeals && Array.isArray(preferences.cheatMeals)) {
    preferred.push(...preferences.cheatMeals);
  }

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
    carbs: ["arroz", "pasta", "pan", "avena", "patata", "quinoa", "batata", "tortilla", "fruta", "platano", "manzana", "frijoles"],
    proteina: ["pollo", "pavo", "huevo", "atun", "lentejas", "yogur", "carne", "pescado", "tofu", "frijoles", "salmon", "res", "bistec"],
    grasas: ["aguacate", "almendra", "nuez", "aceite", "queso", "chia", "cacahuate", "mantequilla", "aceituna"],
  };

  const cheatTerms = preferences.cheatMeals || [];
  
  // Términos más específicos para evitar basura
  const EXTRA_TERMS = ["verdura", "ensalada", "sopa", "crema", "filete", "tostada", "sandwich", "bowl"];
  
  // Fetch robusto
  const searchList = [...new Set([...terms.carbs, ...terms.proteina, ...terms.grasas, ...EXTRA_TERMS, ...cheatTerms])];
  const apiFoods = await fetchFoodsFromApi(searchList, 30); // Límite por término
  
  const basePool = apiFoods;
  const { list: pool, preferred } = applyPreferences(basePool, preferences);

  // Si el pool es muy pequeño, es un problema. Deberíamos tener al menos 20 items.
  if (pool.length < 10) {
    console.warn("Pool de alimentos muy pequeño:", pool.length);
  }

  const usedGlobal = new Set();
  const items = [];
  
  for (let mealIndex = 1; mealIndex <= mealsCount; mealIndex++) {
    const usedMeal = new Set(); // Reset por comida para evitar duplicados en EL MISMO plato
    
    for (const key of ["proteina", "carbs", "grasas"]) { // Orden: Proteína primero suele ser mejor
      const targetPerMeal = targetsGrams[key] / mealsCount;
      
      // 1. Intentar buscar no usados globalmente
      let candidates = pickCandidates(pool, key, targetPerMeal, preferred)
        .filter(({ f }) => !usedGlobal.has(f.name) && !usedMeal.has(f.name));
      
      // 2. Si no hay, buscar no usados en esta comida (permitir repetir de otra comida)
      if (candidates.length === 0) {
        candidates = pickCandidates(pool, key, targetPerMeal, preferred)
          .filter(({ f }) => !usedMeal.has(f.name));
      }

      // Selección con variedad: tomar de los mejores X pero con aleatoriedad
      const topCount = Math.min(candidates.length, 8);
      const chosenWrapper = topCount > 0 ? candidates[Math.floor(Math.random() * topCount)] : null;
      
      let chosenFood = chosenWrapper?.f;
      let grams = chosenWrapper?.grams;

      // Fallback final de emergencia: Random del pool total que no esté en esta comida
      if (!chosenFood) {
        const validPool = pool.filter(f => !usedMeal.has(f.name));
        if (validPool.length > 0) {
            chosenFood = validPool[Math.floor(Math.random() * validPool.length)];
            // Calcular gramos aproximados para este fallback
            const density = (key === 'carbs' ? chosenFood.carbsG : key === 'proteina' ? chosenFood.proteinaG : chosenFood.grasasG) || 10;
            grams = nearestStep((targetPerMeal / density) * 100);
        }
      }

      if (!chosenFood) continue;

      usedMeal.add(chosenFood.name);
      usedGlobal.add(chosenFood.name);
      
      items.push({
        name: chosenFood.name,
        calories: Number(chosenFood.calories),
        carbsG: Number(chosenFood.carbsG),
        proteinaG: Number(chosenFood.proteinaG),
        grasasG: Number(chosenFood.grasasG),
        qty: 1,
        grams: grams || 100,
        mealIndex,
      });
    }
  }

  // Ajuste fino iterativo
  let iterations = 0;
  const MAX_ITERATIONS = 10;
  
  while (iterations < MAX_ITERATIONS) {
    const currentTotal = items.reduce((sum, it) => sum + (it.calories * (it.grams / 100) * it.qty), 0);
    const delta = targetTotal - currentTotal;
    
    // Si estamos cerca (±50 cal), terminamos
    if (Math.abs(delta) < 50) break;
    
    const scale = targetTotal / (currentTotal || 1);
    
    // Aplicar escala suave
    let changed = false;
    for (const it of items) {
      const oldGrams = it.grams;
      // Escalar pero mantener dentro de límites razonables
      let newGrams = nearestStep(it.grams * scale);
      
      // Si la escala no cambió nada, forzar un paso si el delta es grande
      if (newGrams === oldGrams && Math.abs(delta) > 100) {
         if (delta > 0) newGrams += 10;
         else newGrams -= 10;
      }
      
      // Límites duros
      newGrams = Math.max(20, Math.min(600, newGrams));
      
      if (newGrams !== oldGrams) {
        it.grams = newGrams;
        changed = true;
      }
    }
    
    if (!changed) break; // Si no pudimos cambiar nada, salir
    iterations++;
  }

  return items;
}
