export function activityFactor(label) {
  if (label === "sedentario") return 1.2;
  if (label === "ligero") return 1.375;
  if (label === "moderado") return 1.55;
  if (label === "intenso") return 1.725;
  return 1.2;
}

export function computeBudget(gender, heightCm, weightKg, goalLabel, actLabel, age = 30) {
  const s = gender === "male" ? 5 : -161;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + s;
  const tdee = bmr * activityFactor(actLabel);
  if (goalLabel === "bajar") return Math.max(1200, tdee - 500);
  if (goalLabel === "subir") return tdee + 300;
  return tdee;
}
