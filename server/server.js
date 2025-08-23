import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rutas
import summaryRoutes from './routes/summaryRoutes.js';

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
      throw new Error('❌ MONGODB_URI is not defined in environment variables');
    }

    if (!uri.startsWith('mongodb+srv://')) {
      throw new Error('❌ Invalid MongoDB URI format. Must start with mongodb+srv://');
    }

    console.log('🔗 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected to: ${conn.connection.name}`);
    console.log(`📍 Database: ${conn.connection.db.databaseName}`);
    console.log(`📍 Host: ${conn.connection.host}`);
    
    return conn;
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('💡 Please check:');
    console.log('1. ✅ MONGODB_URI environment variable');
    console.log('2. ✅ MongoDB Atlas user credentials');
    console.log('3. ✅ Network access in MongoDB Atlas');
    process.exit(1);
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
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ✅ Usar las rutas importadas de summaryRoutes
app.use('/api/summary', summaryRoutes);

// ---- SERVIR FRONTEND REACT ----
app.use(express.static(path.join(__dirname, '../client/dist')));

// ✅ Catch-all para SPA - debe ir ÚLTIMO
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'API endpoint not found',
      availableEndpoints: {
        summary: {
          GET: '/api/summary',
          POST: '/api/summary'
        },
        test: '/api/test'
      }
    });
  }
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('🚨 Global error handler:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`📍 MongoDB State: ${mongoose.connection.readyState}`);
  console.log('📊 Available endpoints:');
  console.log('   GET  /api              - API status');
  console.log('   GET  /api/test         - Test endpoint');
  console.log('   GET  /api/summary      - Get all summaries');
  console.log('   POST /api/summary      - Create new summary');
});