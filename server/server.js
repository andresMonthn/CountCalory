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
      console.warn('⚠️ MONGODB_URI not defined, running without database');
      return null;
    }

    if (!uri.startsWith('mongodb+srv://')) {
      throw new Error('❌ Invalid MongoDB URI format');
    }

    console.log('🔗 Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected to: ${conn.connection.name}`);
    return conn;
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('⚠️ Running without database connection');
    return null;
  }
};

// Conectar a la base de datos
connectDB();

// Routes API
app.get('/api', (req, res) => {
  res.json({
    message: 'CountCalory API is running!',
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
    message: 'CORS is working!',
    timestamp: new Date().toISOString()
  });
});

// ✅ Ruta GET para obtener summaries - DEBE estar ANTES del catch-all
app.get('/api/summary', async (req, res) => {
  try {
    console.log('📋 GET /api/summary called');
    
    // Si MongoDB está conectado, usar base de datos
    if (mongoose.connection.readyState === 1) {
      // Aquí iría tu lógica con MongoDB
      // const summaries = await Summary.find().sort({ createdAt: -1 });
      // return res.json(summaries);
    }
    
    // Temporal: devolver array vacío
    res.json([]);
    
  } catch (error) {
    console.error('❌ Error fetching summaries:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// ✅ Ruta POST para crear summaries
app.post('/api/summary', async (req, res) => {
  try {
    console.log('📦 POST /api/summary called with:', req.body);
    
    // Si MongoDB está conectado, guardar en base de datos
    if (mongoose.connection.readyState === 1) {
      // Aquí iría tu lógica con MongoDB
      // const newSummary = await Summary.create(req.body);
      // return res.json(newSummary);
    }
    
    // Temporal: devolver los datos recibidos
    res.json({
      success: true,
      message: 'Data received successfully (MongoDB not connected)',
      data: req.body,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error saving summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- SERVIR FRONTEND REACT ----
app.use(express.static(path.join(__dirname, '../client/dist')));

// ✅ Catch-all para SPA - DEBE ir ÚLTIMO
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`📍 MongoDB: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
});