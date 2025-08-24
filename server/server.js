// -------------------------------
// 📌 Importar dependencias
// -------------------------------
import cors from 'cors';             // Middleware para permitir peticiones desde otros dominios (CORS)
import express from 'express';       // Framework web para Node.js
import mongoose from 'mongoose';     // ODM para MongoDB
import path from 'path';             // Manejo de rutas de archivos
import { fileURLToPath } from 'url'; // Necesario para obtener __dirname en ES Modules

// -------------------------------
// 📌 Importar rutas personalizadas
// -------------------------------
import summaryRoutes from './routes/summaryRoutes.js';

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

// -------------------------------
// 📌 Conexión a MongoDB (Atlas en Producción)
// -------------------------------
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI; 
    // En desarrollo puedes usar mongodb://127.0.0.1:27017/nombredb
    // En producción usas mongodb+srv://usuario:password@cluster.mongodb.net/nombredb

    console.log('🔍 Checking MongoDB connection...');

    if (!uri) {
      throw new Error('❌ MONGODB_URI is not defined in environment variables');
    }

    if (!uri.startsWith('mongodb+srv://')) {
      // Esto fuerza a usar un cluster de Atlas. 
      // Si quieres permitir local, quita esta validación.
      throw new Error('❌ Invalid MongoDB URI format. Must start with mongodb+srv://');
    }

    console.log('🔗 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // tiempo de espera si no conecta
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
    process.exit(1); // 🔴 Cierra el servidor si falla la conexión
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

// -------------------------------
// 📌 Rutas API de la aplicación
// -------------------------------
app.use('/api/summary', summaryRoutes);

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
      availableEndpoints: {
        summary: {
          GET: '/api/summary',
          POST: '/api/summary'
        },
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
