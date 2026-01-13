import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyDBName() {
    console.log('\n🔍 VERIFICACIÓN DE NOMBRE DE BASE DE DATOS\n');

    // Determinar URI (Simulando lógica de server.js)
    const env = process.env.NODE_ENV || 'development';
    const dbMode = process.env.DB_MODE;
    let uri;
    let modeLabel;

    if (env === 'production' || dbMode === 'atlas') {
        uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        modeLabel = 'ATLAS / PROD';
    } else {
        uri = process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/countcalory';
        modeLabel = 'LOCAL / DEV';
    }

    console.log(`🌍 Modo: ${modeLabel}`);
    // Ocultar credenciales en logs
    const maskedUri = uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'UNDEFINED';
    console.log(`🔗 URI Objetivo: ${maskedUri}`);

    if (!uri) {
        console.error('❌ Error: No se encontró URI de conexión');
        process.exit(1);
    }

    try {
        console.log('⏳ Conectando...');
        // Usamos la misma configuración que en server.js
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            dbName: 'countcalory' // La configuración forzada que añadimos
        });

        console.log('\n✅ CONEXIÓN EXITOSA');
        console.log('--------------------------------------------------');
        console.log(`📍 Host:           ${conn.connection.host}`);
        console.log(`📍 Base de Datos:  ${conn.connection.name}`);
        console.log('--------------------------------------------------');

        if (conn.connection.name === 'countcalory') {
            console.log('✨ VALIDACIÓN CORRECTA: La base de datos es "countcalory"');
        } else {
            console.error(`❌ ERROR: El nombre de la base de datos es "${conn.connection.name}", se esperaba "countcalory"`);
        }

        await mongoose.disconnect();

    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

verifyDBName();
