import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import summaryRoutes from "./routes/summaryRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/summary", summaryRoutes);

// Conexión a MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/caloriesDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));


app.get("/", (req, res) => {
  res.send("Servidor funcionando 👍");
});
