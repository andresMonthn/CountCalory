import Summary from "../models/Summary.js";

// Guardar un nuevo resumen
export const createSummary = async (req, res) => {
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
    
    console.log('💾 Summary saved to MongoDB:', newSummary._id);
    res.status(201).json(newSummary);
    
  } catch (err) {
    console.error('❌ Error creating summary:', err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener historial completo
export const getSummaries = async (req, res) => {
  try {
    const summaries = await Summary.find().sort({ createdAt: -1 });
    
    console.log(`📊 Returning ${summaries.length} summaries`);
    res.json(summaries);
    
  } catch (err) {
    console.error('❌ Error fetching summaries:', err);
    res.status(500).json({ error: err.message });
  }
};

// Eliminar historial
export const deleteSummaries = async (req, res) => {
  try {
    await Summary.deleteMany({});
    
    console.log('🗑️ All summaries deleted');
    res.json({ message: "Historial eliminado" });
    
  } catch (err) {
    console.error('❌ Error deleting summaries:', err);
    res.status(500).json({ error: err.message });
  }
};