import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export function MacroTable({ foods, onQtyChange, onGramsChange, onReachEnd }) {
  const rows = Array.isArray(foods) ? foods : [];
  const fmt = (n) => Number.isFinite(n) ? (Math.round(n * 10) / 10).toFixed(1) : "0.0";
  const steps = [25, 50, 100, 125, 150];
  const hasMeals = rows.some((f) => Number.isFinite(f.mealIndex));
  const wrapRef = useRef(null);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) onReachEnd?.();
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [onReachEnd]);
  const totals = rows.reduce((acc, f) => {
    const q = Number(f.qty || 1);
    const g = Number(f.grams || 100);
    const factor = q * (g / 100);
    acc.carbsG += factor * Number(f.carbsG || 0);
    acc.proteinaG += factor * Number(f.proteinaG || 0);
    acc.grasasG += factor * Number(f.grasasG || 0);
    acc.calories = (acc.calories || 0) + factor * Number(f.calories || 0);
    return acc;
  }, { carbsG: 0, proteinaG: 0, grasasG: 0, calories: 0 });
  return (
    <div ref={wrapRef} className="mt-3 w-full max-w-[960px] h-[360px] rounded bg-slate-900 text-slate-200 overflow-auto">
      <table className="w-full table-auto text-xs">
        <thead>
          <tr className="text-left border-b border-slate-700">
            <th className="p-2">Alimento</th>
            <th className="p-2">Carbs (g)</th>
            <th className="p-2">Proteína (g)</th>
            <th className="p-2">Grasas (g)</th>
            <th className="p-2">Calorías</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Porción (g)</th>
          </tr>
        </thead>
        <tbody>
          {!hasMeals && rows.map((f, i) => {
            const q = Number(f.qty || 1);
            const g = Number(f.grams || 100);
            const factor = q * (g / 100);
            const idx = steps.findIndex((s) => s === g);
            return (
              <tr key={`${f.name}-${i}`} className="border-b border-slate-800">
                <td className="p-2 truncate">{f.name}</td>
                <td className="p-2">{fmt(factor * Number(f.carbsG || 0))}</td>
                <td className="p-2">{fmt(factor * Number(f.proteinaG || 0))}</td>
                <td className="p-2">{fmt(factor * Number(f.grasasG || 0))}</td>
                <td className="p-2">{fmt(factor * Number(f.calories || 0))}</td>
                <td className="p-2">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" onClick={() => onQtyChange?.(i, Math.max(1, q - 1))}>-</Button>
                    <span className="px-2">{q}</span>
                    <Button size="sm" variant="outline" onClick={() => onQtyChange?.(i, q + 1)}>+</Button>
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" onClick={() => {
                      const prevIdx = idx > 0 ? idx - 1 : 0;
                      const nextG = steps[prevIdx] ?? 25;
                      onGramsChange?.(i, nextG);
                    }}>
                      <ArrowDown size={14} />
                    </Button>
                    <span className="px-2">{g}g</span>
                    <Button size="sm" variant="outline" onClick={() => {
                      const nextIdx = idx >= 0 && idx < steps.length - 1 ? idx + 1 : steps.length - 1;
                      const nextG = steps[nextIdx] ?? 150;
                      onGramsChange?.(i, nextG);
                    }}>
                      <ArrowUp size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
          {hasMeals && (() => {
            const groups = new Map();
            for (const f of rows) {
              const k = Number(f.mealIndex || 1);
              if (!groups.has(k)) groups.set(k, []);
              groups.get(k).push(f);
            }
            const ordered = Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
            let prevTotals = { carbsG: 0, proteinaG: 0, grasasG: 0, calories: 0 };
            const sections = [];
            for (const [meal, items] of ordered) {
              sections.push(
                <tr key={`meal-header-${meal}`} className="bg-slate-800/60">
                  <td className="p-2 font-semibold" colSpan={7}>Comida {meal}</td>
                </tr>
              );
              let mealTotals = { carbsG: 0, proteinaG: 0, grasasG: 0, calories: 0 };
              for (let i = 0; i < items.length; i++) {
                const f = items[i];
                const q = Number(f.qty || 1);
                const g = Number(f.grams || 100);
                const factor = q * (g / 100);
                const idx = steps.findIndex((s) => s === g);
                mealTotals.carbsG += factor * Number(f.carbsG || 0);
                mealTotals.proteinaG += factor * Number(f.proteinaG || 0);
                mealTotals.grasasG += factor * Number(f.grasasG || 0);
                mealTotals.calories += factor * Number(f.calories || 0);
                sections.push(
                  <tr key={`${f.name}-${meal}-${i}`} className="border-b border-slate-800">
                    <td className="p-2 truncate">{f.name}</td>
                    <td className="p-2">{fmt(factor * Number(f.carbsG || 0))}</td>
                    <td className="p-2">{fmt(factor * Number(f.proteinaG || 0))}</td>
                    <td className="p-2">{fmt(factor * Number(f.grasasG || 0))}</td>
                    <td className="p-2">{fmt(factor * Number(f.calories || 0))}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" onClick={() => onQtyChange?.(rows.indexOf(f), Math.max(1, q - 1))}>-</Button>
                        <span className="px-2">{q}</span>
                        <Button size="sm" variant="outline" onClick={() => onQtyChange?.(rows.indexOf(f), q + 1)}>+</Button>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" onClick={() => {
                          const prevIdx = idx > 0 ? idx - 1 : 0;
                          const nextG = steps[prevIdx] ?? 25;
                          onGramsChange?.(rows.indexOf(f), nextG);
                        }}>
                          <ArrowDown size={14} />
                        </Button>
                        <span className="px-2">{g}g</span>
                        <Button size="sm" variant="outline" onClick={() => {
                          const nextIdx = idx >= 0 && idx < steps.length - 1 ? idx + 1 : steps.length - 1;
                          const nextG = steps[nextIdx] ?? 150;
                          onGramsChange?.(rows.indexOf(f), nextG);
                        }}>
                          <ArrowUp size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              }
              const delta = {
                carbsG: mealTotals.carbsG - prevTotals.carbsG,
                proteinaG: mealTotals.proteinaG - prevTotals.proteinaG,
                grasasG: mealTotals.grasasG - prevTotals.grasasG,
                calories: mealTotals.calories - prevTotals.calories,
              };
              sections.push(
                <tr key={`meal-subtotal-${meal}`} className="bg-slate-900/70">
                  <td className="p-2 font-semibold">Subtotal</td>
                  <td className="p-2 font-semibold">{fmt(mealTotals.carbsG)} <span className="text-slate-400">({delta.carbsG > 0 ? "+" : ""}{fmt(delta.carbsG)})</span></td>
                  <td className="p-2 font-semibold">{fmt(mealTotals.proteinaG)} <span className="text-slate-400">({delta.proteinaG > 0 ? "+" : ""}{fmt(delta.proteinaG)})</span></td>
                  <td className="p-2 font-semibold">{fmt(mealTotals.grasasG)} <span className="text-slate-400">({delta.grasasG > 0 ? "+" : ""}{fmt(delta.grasasG)})</span></td>
                  <td className="p-2 font-semibold">{fmt(mealTotals.calories)} <span className="text-slate-400">({delta.calories > 0 ? "+" : ""}{fmt(delta.calories)})</span></td>
                  <td className="p-2 font-semibold" />
                  <td className="p-2 font-semibold" />
                </tr>
              );
              prevTotals = mealTotals;
            }
            return sections;
          })()}
        </tbody>
        <tfoot>
          <tr>
            <td className="p-2 font-semibold">Totales</td>
            <td className="p-2 font-semibold">{fmt(totals.carbsG)}</td>
            <td className="p-2 font-semibold">{fmt(totals.proteinaG)}</td>
            <td className="p-2 font-semibold">{fmt(totals.grasasG)}</td>
            <td className="p-2 font-semibold">{fmt(totals.calories)}</td>
            <td className="p-2 font-semibold" />
            <td className="p-2 font-semibold" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
