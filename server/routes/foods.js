import { Router } from "express";
import { Food, MACROS } from "../models/Food.js";

const router = Router();

router.get("/search", async (req, res) => {
  try {
    const { q = "", category, limit = 10 } = req.query;
    const criteria = {};

    if (q && q.trim()) {
      criteria.$or = [
        { name: new RegExp(q.trim(), "i") },
        { $text: { $search: q.trim() } },
      ];
    }

    if (category) {
      const cats = Array.isArray(category) ? category : String(category).split(",");
      const valid = cats.filter(c => MACROS.includes(c));
      if (valid.length) criteria.categories = { $in: valid };
    }

    const items = await Food.find(criteria)
      .sort({ name: 1 })
      .limit(Number(limit));

    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error buscando alimentos" });
  }
});

export default router;
