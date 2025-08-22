import express from "express";
import mongoose from "mongoose";
import path from 'path';
import cors from "cors";
import summaryRoutes from "./routes/summaryRoutes.js";
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });//para el despliege en MongoDB Atlas
//mongoose.connect("mongodb://

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/summary", summaryRoutes);


// ---- SERVIR FRONTEND REACT ----
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});


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
