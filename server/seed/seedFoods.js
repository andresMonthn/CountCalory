import mongoose from "mongoose";
import { Food } from "../models/Food.js";

const uri = process.env.MONGODB_URI_LOCAL || "mongodb://127.0.0.1:27017/countcalory";
const SOURCE_URL = "https://recetasdecocina.elmundo.es/tabla-calorias";

const CATEGORY_MACROS = {
  "VERDURAS Y HORTALIZAS": ["carbs"],
  "FRUTAS": ["carbs"],
  "FRUTOS SECOS": ["grasas", "proteina"],
  "LÁCTEOS Y DERIVADOS": ["proteina", "grasas"],
  "CARNES, CAZA Y EMBUTIDOS": ["proteina", "grasas"],
  "PESCADOS, CRUSTÁCEOS Y MARISCOS": ["proteina"],
  "AZÚCARES Y DULCES": ["carbs"],
  "CEREALES Y DERIVADOS": ["carbs"],
  "LEGUMBRES": ["proteina", "carbs"],
};

async function fetchText(url) {
  if (typeof fetch === "function") {
    const res = await fetch(url);
    return await res.text();
  }
  const https = await import("https");
  return new Promise((resolve, reject) => {
    https.get(url, (resp) => {
      let data = "";
      resp.on("data", (chunk) => (data += chunk));
      resp.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/\t+/g, " ")
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function parseFoodsFromText(text) {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const items = [];
  let currentCat = null;
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];
    if (CATEGORY_MACROS[line]) {
      currentCat = line;
      continue;
    }
    const kcalLine = lines[i + 1];
    if (/^\d{2,4}$/.test(kcalLine) && /[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(line)) {
      const name = `${line} (100g)`;
      const calories = Number(kcalLine);
      const categories = CATEGORY_MACROS[currentCat] || [];
      let carbsG = 0, proteinaG = 0, grasasG = 0;
      const end = Math.min(lines.length, i + 25);
      const norm = (s) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
      const num = (s) => {
        const m = s.match(/(\d+(?:[\.,]\d+)?)/);
        if (!m) return 0;
        return Number(String(m[1]).replace(',', '.'));
      };
      for (let j = i + 2; j < end; j++) {
        const lj = norm(lines[j]);
        if (!carbsG && (lj.includes('hidratos') || lj.includes('carbohidratos') || lj.includes('carbohydrates'))) carbsG = num(lj);
        if (!proteinaG && (lj.includes('proteinas') || lj.includes('proteina') || lj.includes('protein'))) proteinaG = num(lj);
        if (!grasasG && (lj.includes('grasas') || lj.includes('fat'))) grasasG = num(lj);
        if (carbsG && proteinaG && grasasG) break;
      }
      items.push({ name, calories, categories, carbsG, proteinaG, grasasG });
      i++; // skip number line
    }
  }
  // de-duplicate by name
  const seen = new Set();
  const unique = [];
  for (const it of items) {
    if (seen.has(it.name)) continue;
    seen.add(it.name);
    unique.push(it);
  }
  return unique;
}

function augmentFoods(base, target = 1250) {
  if (base.length >= target) return base.slice(0, target);
  const methods = [
    "(100g, fresco)",
    "(100g, congelado)",
    "(100g, enlatado)",
    "(100g, al horno)",
    "(100g, a la parrilla)",
    "(100g, a la plancha)",
    "(100g, cocido)",
  ];
  const out = [...base];
  const seen = new Set(out.map((x) => x.name));
  let idx = 0;
  while (out.length < target && idx < base.length * methods.length) {
    const b = base[idx % base.length];
    const m = methods[Math.floor(idx / base.length) % methods.length];
    const name = `${b.name.split(" (100g)")[0]} ${m}`;
    if (!seen.has(name)) {
      seen.add(name);
      out.push({ name, calories: b.calories, categories: b.categories });
    }
    idx++;
  }
  return out.slice(0, target);
}

function computeMacroGrams(calories, categories) {
  const perGram = { carbs: 4, proteina: 4, grasas: 9 };
  const cats = Array.isArray(categories) && categories.length ? categories : ["carbs"];
  const share = 1 / cats.length;
  const grams = { carbsG: 0, proteinaG: 0, grasasG: 0 };
  for (const c of cats) {
    const calsForMacro = calories * share;
    const g = calsForMacro / perGram[c];
    const rounded = Math.round(g * 10) / 10;
    if (c === "carbs") grams.carbsG = rounded;
    else if (c === "proteina") grams.proteinaG = rounded;
    else if (c === "grasas") grams.grasasG = rounded;
  }
  return grams;
}

async function run() {
  await mongoose.connect(uri);
  const html = await fetchText(SOURCE_URL);
  const text = strip(html);
  let parsed = parseFoodsFromText(text);
  parsed = augmentFoods(parsed, 1250);

  const required = [
    { name: "Leche (100g)", calories: 60, categories: ["proteina", "grasas"] },
    { name: "Carne de res (100g)", calories: 250, categories: ["proteina", "grasas"] },
    { name: "Cacahuates (100g)", calories: 567, categories: ["grasas", "proteina"] },
  ];
  const existingNames = new Set(parsed.map(x => x.name));
  for (const r of required) {
    if (!existingNames.has(r.name)) parsed.push(r);
  }

  if (!parsed.length) throw new Error("No se pudieron extraer alimentos de la tabla");

  await Food.deleteMany({});
  const docs = parsed.map(p => ({
    name: p.name,
    calories: p.calories,
    categories: p.categories || [],
    ...(p.carbsG || p.proteinaG || p.grasasG ? { carbsG: p.carbsG || 0, proteinaG: p.proteinaG || 0, grasasG: p.grasasG || 0 } : computeMacroGrams(p.calories, p.categories || [])),
  }));
  await Food.insertMany(docs);
  console.log(`Seeded ${parsed.length} foods`);
  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
