export function HistoryPanel({ history }) {
  return (
    <details className="detalles">
      <h2 className="text-xl font-bold mb-4">Historial de Resúmenes</h2>
      <div>
        {history.length === 0 ? (
          <p>No hay resúmenes guardados.</p>
        ) : (
          history.map((s, index) => (
            <div key={index} className="p-4 border rounded mb-2 bg-gray-50 historial">
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
    </details>
  );
}
