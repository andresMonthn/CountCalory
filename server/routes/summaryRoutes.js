import express from "express";
import Summary from "../models/Summary.js";

const router = express.Router();

// Crear resumen
router.post("/", async (req, res) => {
  try {
    const summary = new Summary(req.body);
    await summary.save();
    res.status(201).json(summary);
  } catch (err) {
    res.status(500).json({ error: "Error al guardar el resumen" });
  }
});

// Obtener todos los resúmenes
router.get("/", async (req, res) => {
  try {
    const summaries = await Summary.find();
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los resúmenes" });
  }
});

export default router;
