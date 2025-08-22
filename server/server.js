import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';

import summaryRoutes from './routes/summaryRoutes.js';

mongoose.connect(
    process.env.MONGO_URI,
    {

    });  // para el despliege en MongoDB Atlas
// mongoose.connect("mongodb://

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'CountCalory API is running!',
    endpoints: {test: '/api/test', summary: '/api/summary'}
  });
});

// ✅ Ruta de prueba que SÍ existe
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    timestamp: new Date().toISOString()
  });
});


// Rutas para local
// app.use('/api/summary', summaryRoutes);


// ✅ Ruta para summary (POST)
app.post('/api/summary', async (req, res) => {
  try {
    console.log('📦 Received summary data:', req.body);

    // Aquí va tu lógica para guardar en MongoDB
    // const newSummary = await Summary.create(req.body);

    res.json({
      success: true,
      message: 'Data received successfully',
      data: req.body  // ← temporal, para testing
    });
  } catch (error) {
    console.error('❌ Error saving summary:', error);
    res.status(500).json({success: false, error: error.message});
  }
});

// ---- SERVIR FRONTEND REACT ----
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});


// conexion a Productora de MongoDB Atlas

// mongoose.connect("mongodb+srv://<usuario>:<contraseña>@cluster.mongodb.net/caloriesDB?retryWrites=true&w=majority", {
// useNewUrlParser: true, useUnifiedTopology: true });
const uri = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    // URI directamente desde las variables de Render
    const uri = process.env.MONGODB_URI;

    console.log('Checking MongoDB connection...');

    if (!uri) {
      throw new Error('❌ MONGODB_URI is not defined in Render environment');
    }

    if (!uri.startsWith('mongodb+srv://')) {
      throw new Error('❌ Invalid MongoDB URI format');
    }

    console.log('🔗 Connecting to MongoDB Atlas...');

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected to database: ${conn.connection.name}`);
    console.log(`📍 Host: ${conn.connection.host}`);

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);

    if (error.code === 8000) {
      console.log('🔐 Authentication failed. Please check:');
      console.log('1. ✅ User: andres777monthana exists in Atlas');
      console.log('2. ✅ Password is correct (1111)');
      console.log('3. ✅ Network access allows 0.0.0.0/0');
    }

    process.exit(1);
  }
};

export default connectDB;

// Conexión a MongoDB local
// mongoose
//   .connect("mongodb://127.0.0.1:27017/caloriesDB", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("✅ Conectado a MongoDB");
//     app.listen(PORT, () => console.log(`🚀 Servidor corriendo en
//     http://localhost:${PORT}`));
//   })
//   .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));


app.get('/', (req, res) => {
  res.send('Servidor funcionando 👍');
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`📍 Test endpoint: /api/test`);
});
