import mongoose from "mongoose";

const VALID_TYPES = ["breakfast", "lunch", "dinner", "snacks", "exercise"];

const EntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: VALID_TYPES,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      required: [true, "El nombre es requerido"],
      maxlength: 120,
    },
    calories: {
      type: Number,
      required: true,
      min: [0, "Las calorías no pueden ser negativas"],
    },
    date: {
      type: Date,
      default: () => new Date(),
      index: true,
    }
    // Futuro: userId para multiusuario, presupuesto diario, etc.
  },
  { timestamps: true }
);

export const Entry = mongoose.model("Entry", EntrySchema);
export const ENTRY_TYPES = VALID_TYPES;
