import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Para ES modules - obtener __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    console.log('🔍 Checking MongoDB connection...');

    if (!uri) {
      throw new Error('❌ MONGODB_URI is not defined');
    }

    if (!uri.startsWith('mongodb+srv://')) {
      throw new Error('❌ Invalid MongoDB URI format');
    }

    console.log('🔗 Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected to: ${conn.connection.name}`);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Conectar a la base de datos
connectDB();

// Routes API
app.get('/api', (req, res) => {
  res.json({
    message: 'CountCalory API is running!',
    endpoints: {
      test: '/api/test',
      summary: '/api/summary'
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/summary', async (req, res) => {
  try {
    console.log('📦 Received summary data:', req.body);
    res.json({
      success: true,
      message: 'Data received successfully',
      data: req.body
    });
  } catch (error) {
    console.error('❌ Error saving summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- SERVIR FRONTEND REACT ----
// IMPORTANTE: Esta parte debe ir AL FINAL de las rutas de API

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../client/dist')));

// 3. FINALMENTE: catch-all para SPA (debe ir ÚLTIMO)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Todas las rutas que no sean /api/* deben servir el frontend
app.get('/api/summary', async (req, res) => {
  try {
    console.log('📋 Fetching summaries...');
    
    // SI USAS MONGODB:
    // const summaries = await Summary.find().sort({ createdAt: -1 });
    // return res.json(summaries);

    // TEMPORAL: Devuelve un ARRAY vacío o con datos de ejemplo
    res.json([]); // ← Esto devuelve un array vacío
    
    // O con datos de ejemplo:
    // res.json([
    //   {
    //     _id: "1",
    //     budget: 2000,
    //     consumed: 500,
    //     exercise: 300,
    //     remaining: 1800,
    //     status: "Deficit",
    //     createdAt: new Date().toISOString()
    //   }
    // ]);
    
  } catch (error) {
    console.error('❌ Error fetching summaries:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
});