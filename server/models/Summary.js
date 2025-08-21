import mongoose from "mongoose";

const summarySchema = new mongoose.Schema({
  budget: { type: Number, required: true },
  consumed: { type: Number, required: true },
  exercise: { type: Number, required: true },
  remaining: { type: Number, required: true },
  status: { type: String, required: true }, // Ejemplo: "saldo positivo" / "saldo negativo"
  date: { type: Date, default: Date.now },
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
});

export default mongoose.model("Summary", summarySchema);
