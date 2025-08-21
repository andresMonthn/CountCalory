import { Router } from "express";
import { Entry, ENTRY_TYPES } from "../models/Entry.js";

const router = Router();

/**
 * Util: validación básica
 */
function validateBody({ type, name, calories, date }) {
  const errors = [];

  if (!ENTRY_TYPES.includes(type)) {
    errors.push(`'type' inválido. Usa uno de: ${ENTRY_TYPES.join(", ")}`);
  }
  if (typeof name !== "string" || !name.trim()) {
    errors.push("'name' es requerido");
  }
  if (typeof calories !== "number" || Number.isNaN(calories) || calories < 0) {
    errors.push("'calories' debe ser un número >= 0");
  }
  if (date && Number.isNaN(Date.parse(date))) {
    errors.push("'date' inválida");
  }

  return errors;
}

/**
 * POST /api/entries
 * Crea una entrada (comida o ejercicio)
 */
router.post("/", async (req, res) => {
  try {
    const { type, name, calories, date } = req.body;

    const errors = validateBody({ type, name, calories, date });
    if (errors.length) return res.status(400).json({ errors });

    const entry = await Entry.create({
      type,
      name: name.trim(),
      calories,
      date: date ? new Date(date) : undefined,
    });

    return res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al crear la entrada" });
  }
});

/**
 * GET /api/entries
 * Lista entradas con filtros: ?type=&from=&to=&limit=&page=
 */
router.get("/", async (req, res) => {
  try {
    const { type, from, to, page = 1, limit = 20 } = req.query;
    const query = {};

    if (type) {
      if (!ENTRY_TYPES.includes(type)) {
        return res.status(400).json({ error: `type inválido. Usa: ${ENTRY_TYPES.join(", ")}` });
      }
      query.type = type;
    }

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Entry.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Entry.countDocuments(query),
    ]);

    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener entradas" });
  }
});

/**
 * DELETE /api/entries/:id
 * Elimina una entrada por id
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const found = await Entry.findById(id);
    if (!found) return res.status(404).json({ error: "Entrada no encontrada" });

    await found.deleteOne();
    res.json({ ok: true, deletedId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar la entrada" });
  }
});

/**
 * GET /api/entries/summary
 * Resumen de calorías en un rango (por defecto hoy)
 * - caloriesConsumed: suma de las comidas (breakfast, lunch, dinner, snacks)
 * - caloriesBurned: suma del ejercicio
 * - net: consumed - burned
 */
router.get("/summary", async (req, res) => {
  try {
    let { from, to } = req.query;

    // Por defecto: hoy (00:00 → 23:59)
    if (!from || !to) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      end.setMilliseconds(end.getMilliseconds() - 1);
      from = from || start.toISOString();
      to = to || end.toISOString();
    }

    const entries = await Entry.find({
      date: { $gte: new Date(from), $lte: new Date(to) },
    });

    const caloriesConsumed = entries
      .filter(e => e.type !== "exercise")
      .reduce((acc, e) => acc + e.calories, 0);

    const caloriesBurned = entries
      .filter(e => e.type === "exercise")
      .reduce((acc, e) => acc + e.calories, 0);

    const net = caloriesConsumed - caloriesBurned;

    res.json({
      from,
      to,
      totals: {
        caloriesConsumed,
        caloriesBurned,
        net
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al calcular el resumen" });
  }
});

export default router;
