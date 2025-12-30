// -------------------------------
// 📌 Importar dependencias
// -------------------------------
import 'dotenv/config';          // Cargar variables de entorno al inicio
import cors from 'cors';             // Middleware para permitir peticiones desde otros dominios (CORS)
import express from 'express';       // Framework web para Node.js
import mongoose from 'mongoose';     // ODM para MongoDB
import path from 'path';             // Manejo de rutas de archivos
import { fileURLToPath } from 'url'; // Necesario para obtener __dirname en ES Modules
// -------------------------------
// 📌 Importar rutas personalizadas
// -------------------------------
import summaryRoutes from './routes/summaryRoutes.js';
import foodsRoutes from './routes/foods.js';
import authRoutes from './routes/authRoutes.js';
// -------------------------------
// 📌 Manejo de __dirname en ESModules
// -------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------
// 📌 Inicializar servidor Express
// -------------------------------
const app = express();
const PORT = process.env.PORT || 4000; 
// En producción Render asigna el PORT automáticamente (ej. 10000). 
// En desarrollo usamos el 4000 por defecto.

// -------------------------------
// 📌 Middlewares globales
// -------------------------------
app.use(cors());          // Habilita CORS (en producción se puede restringir a ciertos dominios)
app.use(express.json());  // Permite recibir JSON en requests

// Middleware de Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// -------------------------------
// 📌 Conexión a MongoDB (Controlado por NODE_ENV)
// -------------------------------
const connectDB = async () => {
  try {
    // Detectar entorno: 'production' (Atlas) vs 'development' (Local)
    const env = process.env.NODE_ENV || 'development';
    const dbMode = process.env.DB_MODE; // Soporte para 'atlas' explícito en dev
    let uri;

    console.log(`🔍 Environment Detection: ${env.toUpperCase()}`);
    if (dbMode) console.log(`🔍 DB Mode Override: ${dbMode.toUpperCase()}`);
    
    if (env === 'production' || dbMode === 'atlas') {
      console.log('☁️ Mode: PRODUCTION/ATLAS -> Usando MongoDB Atlas');
      uri = process.env.MONGO_URI || process.env.MONGODB_URI;
      
      if (!uri) {
         throw new Error('❌ MONGO_URI no definida para entorno de producción');
      }
    } else {
      console.log('🏠 Mode: DEVELOPMENT -> Usando MongoDB Local');
      uri = process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/countcalory';
    }

    console.log(`🔗 Target URI: ${uri.replace(/:([^:@]+)@/, ':****@')}`);

    console.log('🔗 Connecting...');
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected successfully!`);
    console.log(`📍 Database Name: ${conn.connection.name}`);
    console.log(`📍 Host: ${conn.connection.host}`);
    
    return conn;
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('💡 Troubleshooting:');
    console.log('1. Check NODE_ENV in your environment variables.');
    console.log('2. If production, ensure MONGO_URI is set.');
    console.log('3. If development, ensure local mongod is running.');
    process.exit(1); 
  }
};

// Ejecutar la conexión a la base de datos
connectDB();

// -------------------------------
// 📌 Endpoints básicos de prueba
// -------------------------------
app.get('/api', (req, res) => {
  res.json({
    message: 'CountCalory API is running!',
    // mongoose.connection.readyState === 1 significa conectado
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      test: '/api/test',
      summary: '/api/summary',
      auth: '/api/auth'
    }
  });
});

// -------------------------------
// 📌 Rutas de la API
// -------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/foods', foodsRoutes);

// -------------------------------
// 📌 Servir frontend de React (Build)
// -------------------------------
// ⚠️ En desarrollo se usa Vite/React con "npm run dev"
// ⚠️ En producción (Render/Vercel) se sirve la carpeta "client/dist" generada por "npm run build"
app.use(express.static(path.join(__dirname, '../client/dist')));

// ✅ Catch-all para SPA (React Router) → debe ir al final
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    // Si la ruta empieza con /api/ y no existe → 404 de API
    return res.status(404).json({ 
      error: 'API endpoint not found',
      requestedPath: req.path,
      availableEndpoints: {
        summary: '/api/summary',
        auth: '/api/auth',
        foods: '/api/foods',
        test: '/api/test'
      }
    });
  }
  // Si no es API, devolvemos index.html del frontend
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// -------------------------------
// 📌 Manejo global de errores
// -------------------------------
app.use((error, req, res, next) => {
  console.error('🚨 Global error handler:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// -------------------------------
// 📌 Iniciar servidor
// -------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Network Access: http://<YOUR_IP>:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`📍 MongoDB State: ${mongoose.connection.readyState}`);
  console.log('📊 Available endpoints:');
  console.log('   GET  /api              - API status');
  console.log('   GET  /api/test         - Test endpoint');
  console.log('   GET  /api/summary      - Get all summaries');
  console.log('   POST /api/summary      - Create new summary');
});
