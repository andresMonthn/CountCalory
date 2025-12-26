export function HistoryPanel({ history }) {
  return (
    <details className="detalles">
      <h2 className="text-xl font-bold mb-4">Historial de Resúmenes</h2>
      <div>
        {history.length === 0 ? (
          <p>No hay resúmenes guardados.</p>
        ) : (
          history.map((s, index) => (
            <div key={index} className="p-4 border border-slate-700 rounded mb-2 bg-slate-800 text-slate-200 historial">
              <p><strong>{s.remaining}</strong> calorías {s.status}</p>
              <hr className="my-1 border-slate-600" />
              <p>Presupuesto: {s.budget}</p>
              <p>Consumidas: {s.consumed}</p>
              <p>Ejercicio: {s.exercise}</p>
              <p className="text-sm text-slate-400 mt-1">
                Guardado: {new Date(s.timestamp || s.createdAt || Date.now()).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </details>
  );
}
