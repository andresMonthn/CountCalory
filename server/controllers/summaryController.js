const Summary = require("../models/Summary");

// Guardar un nuevo resumen
exports.createSummary = async (req, res) => {
  try {
    const { budget, consumed, exercise, remaining, status } = req.body;

    const newSummary = new Summary({
      budget,
      consumed,
      exercise,
      remaining,
      status
    });

    await newSummary.save();
    res.status(201).json(newSummary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener historial completo
exports.getSummaries = async (req, res) => {
  try {
    const summaries = await Summary.find().sort({ createdAt: -1 });
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar historial
exports.deleteSummaries = async (req, res) => {
  try {
    await Summary.deleteMany({});
    res.json({ message: "Historial eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
