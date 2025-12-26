// server.local.js
// 🚀 Servidor Express para ENTORNO DE DESARROLLO (LOCAL)

// Importaciones principales
import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

// Importar rutas
import summaryRoutes from './routes/summaryRoutes.js';
import foodsRoutes from './routes/foods.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 4001;

// =========================
// 🔧 CONFIGURACIONES
// =========================

// Middleware
app.use(cors());          // Permite llamadas desde el frontend local (http://localhost:5173, etc.)
app.use(express.json());  // Permite leer JSON en requests

// =========================
// 🔗 CONEXIÓN LOCAL MONGODB
// =========================
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI_LOCAL || "mongodb://127.0.0.1:27017/countcalory";

    console.log("🔍 Conectando a MongoDB Local...");
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // tiempo máximo de espera
      socketTimeoutMS: 45000,
    });

    console.log(`✅ Conectado a MongoDB (local) en: ${conn.connection.host}`);
    console.log(`📍 Base de datos: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB Local:", error.message);
    process.exit(1);
  }
};

// Conectar a la base de datos
connectDB();

// =========================
// 📡 RUTAS API
// =========================
app.get('/api', (req, res) => {
  res.json({
    message: '🌱 CountCalory API en modo DESARROLLO',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      test: '/api/test',
      summary: '/api/summary'
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS y backend funcionando en local 🚀',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ✅ Rutas de summary
app.use('/api/summary', summaryRoutes);
// ✅ Rutas de auth
app.use('/api/auth', authRoutes);
// ✅ Rutas de alimentos (búsqueda local)
app.use('/api/foods', foodsRoutes);

// =========================
// 🚨 MANEJO GLOBAL DE ERRORES
// =========================
app.use((error, req, res, next) => {
  console.error('🚨 Error Global (Dev):', error);
  res.status(500).json({
    error: 'Error interno en el servidor (modo dev)',
    message: error.message
  });
});

// =========================
// ▶️ INICIO DEL SERVIDOR
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Backend (Dev) corriendo en: http://localhost:${PORT}`);
  console.log(`📍 API Local: http://localhost:${PORT}/api`);
  console.log(`📍 Estado DB: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
});
