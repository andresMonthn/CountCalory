import { useEffect, useState } from "react";

export default function SummaryList() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos desde el backend
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const apiUrl = API_URL;
        const res = await fetch(`${apiUrl}/summary`);
        const data = await res.json();
        setSummaries(data);
      } catch (err) {
        console.error("Error al obtener resúmenes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Cargando historial...</p>;
  }

  if (summaries.length === 0) {
    return <p className="text-gray-600">No hay resúmenes guardados.</p>;
  }

  return (
    <div className="card mt-6">
      <h2 className="text-xl font-bold mb-4">Historial de Resúmenes</h2>
      <ul className="space-y-4">
        {summaries.map((s, idx) => (
          <li key={idx} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
            <p>
              <strong>{s.remaining}</strong> calorías {s.status}
            </p>
            <hr className="my-2" />
            <p>Presupuesto: {s.budget}</p>
            <p>Consumidas: {s.consumed}</p>
            <p>Ejercicio: {s.exercise}</p>
            <p className="text-sm text-gray-500 mt-2">
              {s.createdAt
                ? `Guardado: ${new Date(s.createdAt).toLocaleString()}`
                : "Fecha no disponible"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
