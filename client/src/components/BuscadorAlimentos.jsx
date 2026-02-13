import { useState, useEffect, useRef } from 'react';
import { Search, Flame, Loader2, ArrowRight, Utensils, Wheat, Beef, Droplets } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { API_URL } from '@/config/api';

export function BuscadorAlimentos() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const searchTimeout = useRef(null);

  const performSearch = async (term) => {
    if (!term || term.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/foods/search?q=${encodeURIComponent(term)}&limit=20`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];
        setResults(items);
      }
    } catch (error) {
      console.error("Error searching foods:", error);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (query.length >= 2) {
      searchTimeout.current = setTimeout(() => {
        performSearch(query);
      }, 500);
    } else {
      setResults([]);
      setSearched(false);
    }

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-32 pt-6 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
            ¿Cuántas Calorías?
          </h1>
          <p className="text-slate-400 text-lg">
            Descubre el valor nutricional de tus alimentos favoritos
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-500" />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl flex items-center p-2 shadow-xl">
            <Search className="w-6 h-6 text-slate-400 ml-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: Hamburguesa, Arroz, Manzana..."
              className="flex-1 bg-transparent border-none text-slate-100 text-lg px-4 py-3 focus:outline-none placeholder:text-slate-500"
              autoFocus
            />
            {loading && <Loader2 className="w-6 h-6 text-green-400 animate-spin mr-3" />}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((food, index) => (
            <div 
              key={food._id || index}
              className="group relative bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-green-500/50 hover:bg-slate-900/80 transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,222,128,0.1)]"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-green-400 transition-colors">
                    {food.name}
                  </h3>
                  <p className="text-sm text-slate-500">Por cada 100g</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 flex items-center gap-2 group-hover:border-green-500/30 transition-colors">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-black text-orange-400">{food.calories} kcal</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-950/50 rounded-lg p-2 text-center border border-slate-800/50">
                  <div className="flex justify-center mb-1">
                    <Wheat className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-xs text-slate-400">Carbos</div>
                  <div className="font-bold text-slate-200">{food.carbsG || 0}g</div>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-2 text-center border border-slate-800/50">
                  <div className="flex justify-center mb-1">
                    <Beef className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-xs text-slate-400">Proteína</div>
                  <div className="font-bold text-slate-200">{food.proteinaG || 0}g</div>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-2 text-center border border-slate-800/50">
                  <div className="flex justify-center mb-1">
                    <Droplets className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-xs text-slate-400">Grasas</div>
                  <div className="font-bold text-slate-200">{food.grasasG || 0}g</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-slate-900/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-slate-800">
              <Utensils className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-medium text-slate-300 mb-2">No encontramos ese alimento</h3>
            <p className="text-slate-500">Intenta con otro término o verifica la ortografía.</p>
          </div>
        )}

        {/* Initial State */}
        {!searched && !loading && (
          <div className="text-center py-12 opacity-50">
            <Search className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">Escribe algo para comenzar a buscar</p>
          </div>
        )}
      </div>
    </div>
  );
}
