import './App.css'
import { useState, useEffect } from "react";

const foodOptions = [
  { name: "Huevos (2 piezas)", calories: 140 },
  { name: "Pan integral (2 rebanadas)", calories: 120 },
  { name: "Avena (1 taza cocida)", calories: 150 },
  { name: "Leche descremada (1 taza)", calories: 90 },
  { name: "Yogur natural (1 taza)", calories: 100 },
  { name: "Banana (1 mediana)", calories: 105 },
  { name: "Manzana (1 mediana)", calories: 95 },
  { name: "Naranja (1 mediana)", calories: 60 },
  { name: "Fresas (1 taza)", calories: 50 },
  { name: "Arroz blanco (1 taza cocido)", calories: 200 },
  { name: "Pasta cocida (1 taza)", calories: 220 },
  { name: "Pollo a la plancha (100g)", calories: 165 },
  { name: "Carne de res magra (100g)", calories: 250 },
  { name: "Pescado (100g)", calories: 180 },
  { name: "Tofu (100g)", calories: 80 },
  { name: "Aguacate (1 mediano)", calories: 240 },
  { name: "Queso cheddar (30g)", calories: 120 },
  { name: "Almendras (30g)", calories: 170 },
  { name: "Nueces (30g)", calories: 200 },
  { name: "Cacahuates (30g)", calories: 170 },
  { name: "Aceite de oliva (1 cucharada)", calories: 120 },
  { name: "Mantequilla (1 cucharada)", calories: 100 },
  { name: "Sopa de verduras (1 taza)", calories: 80 },
  { name: "Ensalada con aderezo ligero", calories: 150 },
  { name: "Papas al horno (1 mediana)", calories: 160 },
  { name: "Camote (1 mediano)", calories: 130 },
  { name: "Zanahoria (1 mediana)", calories: 25 },
  { name: "Brócoli (1 taza cocido)", calories: 55 },
  { name: "Espinaca (1 taza cocida)", calories: 40 },
  { name: "Galletas integrales (2 piezas)", calories: 70 },
  { name: "Chocolate negro (30g)", calories: 170 },
  { name: "Helado (1/2 taza)", calories: 140 },
  { name: "Refresco (1 lata)", calories: 150 },
  { name: "Agua", calories: 0 },
  { name: "Café negro", calories: 5 },
  { name: "Té verde", calories: 5 },
];

const exerciseOptions = [
  { name: "Caminata ligera 30 min", calories: 100 },
  { name: "Correr 30 min", calories: 300 },
  { name: "Bicicleta 30 min", calories: 250 },
  { name: "Natación 30 min", calories: 200 },
  { name: "Yoga 30 min", calories: 120 },
  { name: "Pesas 1hra", calories: 540 },
];

const API_BASE_URL = "https://countcalory.onrender.com";
const API_SUMMARY = `${API_BASE_URL}/api/summary`;

export default function CalorieCounter() {
  const [budget, setBudget] = useState(2000);
  const [selectedFood, setSelectedFood] = useState(foodOptions[0]);
  const [selectedExercise, setSelectedExercise] = useState(exerciseOptions[0]);
  const [foodList, setFoodList] = useState([]);
  const [exerciseList, setExerciseList] = useState([]);
  const [output, setOutput] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Agregar comida
  const addFood = () => setFoodList([...foodList, selectedFood]);

  // Agregar ejercicio
  const addExercise = () => setExerciseList([...exerciseList, selectedExercise]);

  // Eliminar comida por índice
  const removeFood = (index) => setFoodList(foodList.filter((_, i) => i !== index));

  // Eliminar ejercicio por índice
  const removeExercise = (index) => setExerciseList(exerciseList.filter((_, i) => i !== index));

  // Calcular resumen
  const calculate = () => {
    const consumed = foodList.reduce((sum, f) => sum + f.calories, 0);
    const exercise = exerciseList.reduce((sum, e) => sum + e.calories, 0);
    const remaining = budget - consumed + exercise;
    setOutput({
      budget,
      consumed,
      exercise,
      remaining,
      status: remaining < 0 ? "Surplus" : "Deficit",
    });
  };

  // Guardar resumen en backend
  const saveSummary = async () => {
    if (!output) return;
    
    setLoading(true);
    try {
      const res = await fetch(API_SUMMARY, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...output,
          createdAt: new Date().toISOString()
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorData}`);
      }

      const data = await res.json();
      setHistory(prev => [data, ...prev]);
      alert("✅ Resumen guardado correctamente");
      
    } catch (err) {
      console.error("Error guardando resumen:", err);
      alert("❌ Error al guardar. Verifica la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar historial
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(API_SUMMARY, {
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        const data = await res.json();
        
        if (Array.isArray(data)) {
          setHistory(data);
        } else {
          console.warn('⚠️ Expected array but got:', data);
          setHistory([]);
        }
        
      } catch (err) {
        console.error("Error cargando historial:", err);
        setHistory([]);
      }
    };
    
    fetchHistory();
  }, []);

  return (
    <div className='Scrilles'>
      <div className="CalorieCounter">
        <h1 className="text-2xl font-bold mb-4">Contador de Calorías</h1>
        <img src="image.png" alt="CountCalory Logo" className="w-24 mb-4"/>
        
        <label>Presupuesto diario:</label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="border p-1 w-full mb-4"
        />

        {/* Selección de comidas */}
        <div className="mb-4">
          <label>Alimento:</label>
          <select
            className="border p-1 w-full mb-2"
            value={JSON.stringify(selectedFood)}
            onChange={(e) => setSelectedFood(JSON.parse(e.target.value))}
          >
            {foodOptions.map((f, i) => (
              <option key={i} value={JSON.stringify(f)}>
                {f.name} ({f.calories} Cal)
              </option>
            ))}
          </select>
          <button onClick={addFood} className="bg-blue-500 text-white px-3 py-1 rounded">
            Agregar comida
          </button>

          {foodList.length > 0 && (
            <ul className="mt-2">
              {foodList.map((f, i) => (
                <li key={i} className="flex justify-between items-center bg-gray-200 p-1 my-1 rounded">
                  {f.name} ({f.calories} Cal)
                  <button onClick={() => removeFood(i)} className="text-red-500 ml-2">Eliminar</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selección de ejercicios */}
        <div className="mb-4 controls">
          <label>Ejercicio:</label>
          <select
            className="border p-1 w-full mb-2"
            value={JSON.stringify(selectedExercise)}
            onChange={(e) => setSelectedExercise(JSON.parse(e.target.value))}
          >
            {exerciseOptions.map((e, i) => (
              <option key={i} value={JSON.stringify(e)}>
                {e.name} ({e.calories} Cal)
              </option>
            ))}
          </select>
          <button onClick={addExercise} className="bg-green-500 text-white px-3 py-1 rounded">
            Agregar ejercicio
          </button>

          {exerciseList.length > 0 && (
            <ul className="mt-2">
              {exerciseList.map((e, i) => (
                <li key={i} className="flex justify-between items-center bg-gray-200 p-1 my-1 rounded">
                  {e.name} ({e.calories} Cal)
                  <button onClick={() => removeExercise(i)} className="text-red-500 ml-2">Eliminar</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={calculate}
          className="bg-gray-700 text-white px-3 py-1 rounded mb-4"
        >
          Calcular resumen
        </button>

        {output && (
          <div className="mt-4 p-4 border rounded bg-gray-100">
            <p><strong>{output.remaining}</strong> calorías {output.status}</p>
            <hr className="my-2" />
            <p>Presupuesto: {output.budget}</p>
            <p>Consumidas: {output.consumed}</p>
            <p>Ejercicio: {output.exercise}</p>
            <button
              onClick={saveSummary}
              disabled={loading}
              className="mt-2 bg-purple-500 text-white px-3 py-1 rounded disabled:bg-gray-400"
            >
              {loading ? 'Guardando...' : 'Guardar Resumen'}
            </button>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Historial de Resúmenes</h2>
          {history.length === 0 ? (
            <p>No hay resúmenes guardados.</p>
          ) : (
            history.map((s, index) => (
              <div key={index} className="p-4 border rounded mb-2 bg-gray-50">
                <p><strong>{s.remaining}</strong> calorías {s.status}</p>
                <hr className="my-1" />
                <p>Presupuesto: {s.budget}</p>
                <p>Consumidas: {s.consumed}</p>
                <p>Ejercicio: {s.exercise}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Guardado: {new Date(s.timestamp || s.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}