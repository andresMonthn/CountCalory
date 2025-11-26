import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { foodOptions } from "@/foodOptions";

export function FoodCombobox({ onAdd, disabled, className = "" }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [best, setBest] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const ctrlRef = React.useRef(null);
  const cacheRef = React.useRef(new Map());
  const wrapRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const [triggerW, setTriggerW] = React.useState(600);

  function norm(s) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function lev(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  }
  function score(q, label) {
    const x = norm(q), y = norm(label);
    if (y.startsWith(x)) return 1.0;
    if (y.includes(x)) return 0.9;
    const d = lev(x, y);
    const maxLen = Math.max(x.length, y.length) || 1;
    return 1 - d / maxLen;
  }

  const search = React.useCallback(async (q) => {
    const t = q.trim();
    setError("");
    setResults([]);
    if (t.length < 2) return;
    // pintar rápido con cache
    if (cacheRef.current.has(t)) {
      const cached = cacheRef.current.get(t);
      setResults(cached.results);
      setBest(cached.best || null);
    }
    setLoading(true);
    try {
      // abortar solicitud anterior
      if (ctrlRef.current) ctrlRef.current.abort();
      ctrlRef.current = new AbortController();
      const api = import.meta.env.VITE_API_URL + `/foods/search?q=${encodeURIComponent(t)}&limit=10`;
      const res = await fetch(api, { headers: { 'Accept': 'application/json' }, signal: ctrlRef.current.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const products = Array.isArray(data.items) ? data.items : [];
      const mapped = products.map(p => ({ id: p._id, value: p.name, label: p.name, calories: p.calories, carbsG: p.carbsG ?? 0, proteinaG: p.proteinaG ?? 0, grasasG: p.grasasG ?? 0 }));
      const withScores = mapped.map(item => ({ ...item, _score: score(t, item.label) }));
      withScores.sort((a, b) => b._score - a._score);
      setResults(withScores);
      setBest(withScores[0] || null);
      cacheRef.current.set(t, { results: withScores, best: withScores[0] || null });
      if (mapped.length === 0) setError("No se encontró un alimento válido con calorías");
    } catch (e) {
      if (e.name !== 'AbortError') {
        const local = foodOptions.map(f => ({ id: undefined, value: f.name, label: f.name, calories: f.calories, carbsG: 0, proteinaG: 0, grasasG: 0 }));
        const scored = local.map(item => ({ ...item, _score: score(t, item.label) }));
        scored.sort((a, b) => b._score - a._score);
        const top = scored.slice(0, 10);
        setResults(top);
        setBest(top[0] || null);
        setError("");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const id = setTimeout(() => search(query), 350);
    return () => clearTimeout(id);
  }, [query, search]);

  React.useEffect(() => {
    if (query.length > 0) setOpen(true);
  }, [query]);

  React.useEffect(() => {
    function measure() {
      const w = triggerRef.current?.offsetWidth || 200;
      setTriggerW(w);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div ref={wrapRef} className={"relative flex flex-col items-center justify-start w-full " + className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button ref={triggerRef} variant="outline" role="combobox" aria-expanded={open} aria-label="Buscar alimento" className="flex items-center justify-center gap-2 w-[200px] min-w-[200px] overflow-hidden text-sm" disabled={disabled}>
            <span className="truncate">{value || "Buscar alimento..."}</span>
            <ChevronsUpDown  />
          </Button>
        </PopoverTrigger>
      <PopoverContent side="bottom" align="center" sideOffset={8} className="z-50 p-0 mt-2" style={{ width: triggerW }}>
        <Command>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && best) {
                onAdd?.({ name: `${best.label} (serving)`, calories: best.calories });
                setOpen(false);
                setQuery("");
                setValue("");
                setResults([]);
                setBest(null);
              }
            }}
            placeholder="Escribe el alimento"
            className="h-9"
          />
          <CommandList className="w-full max-h-64 overflow-y-auto text-[11pt]">
            {error && <CommandEmpty>{error}</CommandEmpty>}
            {!error && (
              <CommandGroup>
                {loading && <div className="px-3 py-2 text-sm text-slate-400">Buscando...</div>}
                {results.map((item, idx) => (
                  <CommandItem
                    key={item.id || `${item.value}-${item.calories}-${idx}`}
                    value={item.value}
                    className="flex flex-col items-start whitespace-normal break-words text-[11pt] py-1"
                    onSelect={(currentValue) => {
                      onAdd?.({ name: `${item.label}`, calories: item.calories, carbsG: item.carbsG, proteinaG: item.proteinaG, grasasG: item.grasasG });
                      setOpen(false);
                      setQuery("");
                      setValue("");
                      setResults([]);
                      setBest(null);
                    }}
                  >
                    <span className="truncate w-full text-[11pt]">{item.label}</span>
                    <div className="flex w-full items-center justify-between">
                      <span className="text-slate-400 text-[11pt]">{item.calories} Cal</span>
                      <Check className={cn("ml-2", value === item.value ? "opacity-100" : "opacity-0")} />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    
  </div>
  );
}
