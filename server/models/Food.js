import mongoose from "mongoose";

export const MACROS = ["carbs", "proteina", "grasas"];

const FoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160, index: true },
    calories: { type: Number, required: true, min: 0 },
    categories: { type: [String], enum: MACROS, default: [] },
    carbsG: { type: Number, default: 0, min: 0 },
    proteinaG: { type: Number, default: 0, min: 0 },
    grasasG: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

FoodSchema.index({ name: "text" });

export const Food = mongoose.model("Food", FoodSchema);
