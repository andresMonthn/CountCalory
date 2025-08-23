import express from "express";
import {
  createSummary,
  getSummaries,
  deleteSummaries
} from "../controllers/summaryController.js";

const router = express.Router();

// Crear resumen
router.post("/", createSummary);

// Obtener todos los resúmenes
router.get("/", getSummaries);

// Eliminar historial (opcional)
router.delete("/", deleteSummaries);

export default router;