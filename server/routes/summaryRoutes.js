import express from "express";
import {
  createSummary,
  getSummaries,
  deleteSummaries
} from "../controllers/summaryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Crear resumen
router.post("/", createSummary);

// Obtener todos los resúmenes
router.get("/", getSummaries);

// Eliminar historial (opcional)
router.delete("/", deleteSummaries);

export default router;