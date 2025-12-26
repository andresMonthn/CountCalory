import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Food } from '../models/Food.js';

// Configuración de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Utilidad de Logging
class Logger {
    static info(msg) { console.log(`ℹ️  [INFO] ${msg}`); }
    static success(msg) { console.log(`✅ [SUCCESS] ${msg}`); }
    static error(msg) { console.error(`❌ [ERROR] ${msg}`); }
    static warn(msg) { console.warn(`⚠️  [WARN] ${msg}`); }
    static section(msg) { 
        console.log('\n' + '='.repeat(50));
        console.log(`🔷 ${msg}`);
        console.log('='.repeat(50));
    }
}

// Configuración
const CONFIG = {
    LOCAL_URI: process.env.MONGODB_URI_LOCAL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/countcalory',
    ATLAS_URI: process.env.MONGO_URI, // Debe ser la URI de Atlas
    TEST_COLLECTION: 'foods_integration_test'
};

if (!CONFIG.ATLAS_URI) {
    Logger.error('MONGO_URI (Atlas) no está definido en .env');
    process.exit(1);
}

async function runTest() {
    Logger.section('INICIANDO PRUEBA DE INTEGRACIÓN ATLAS');
    const stats = {
        localCount: 0,
        migratedCount: 0,
        errors: 0
    };

    let localData = [];

    // 1. Extracción de Datos Locales
    try {
        Logger.section('PASO 1: Extracción de Datos Locales (Simulando Compass)');
        Logger.info(`Conectando a Local DB: ${CONFIG.LOCAL_URI}`);
        
        const localConn = await mongoose.createConnection(CONFIG.LOCAL_URI).asPromise();
        Logger.success('Conexión Local Establecida');

        const LocalFood = localConn.model('Food', Food.schema);
        localData = await LocalFood.find({}).lean();
        
        stats.localCount = localData.length;
        Logger.info(`Registros encontrados en local: ${stats.localCount}`);
        
        if (stats.localCount === 0) {
            Logger.warn('No hay datos en la base de datos local. Usando datos de semilla simulados si es necesario.');
        }

        // Validación de estructura
        const sample = localData[0];
        if (sample) {
            Logger.info('Validando estructura de datos (Muestra):');
            const requiredFields = ['name', 'calories'];
            const missing = requiredFields.filter(f => !sample[f]);
            if (missing.length > 0) throw new Error(`Datos corruptos: Faltan campos ${missing.join(', ')}`);
            Logger.success('Estructura de datos válida');
        }

        await localConn.close();
        Logger.success('Conexión Local Cerrada');

    } catch (error) {
        Logger.error(`Fallo en etapa local: ${error.message}`);
        process.exit(1);
    }

    // 2. Conexión a Atlas
    let atlasConn;
    try {
        Logger.section('PASO 2: Conexión a MongoDB Atlas');
        const startPing = Date.now();
        
        atlasConn = await mongoose.createConnection(CONFIG.ATLAS_URI).asPromise();
        const pingTime = Date.now() - startPing;
        
        Logger.success(`Conexión Atlas Establecida (${pingTime}ms)`);
        
        if (pingTime > 2000) Logger.warn('Tiempo de latencia alto hacia Atlas');
        
        // Verificar credenciales (implícito en conexión exitosa)
        const admin = atlasConn.db.admin();
        const serverInfo = await admin.serverStatus();
        Logger.info(`Versión de MongoDB Atlas: ${serverInfo.version}`);

    } catch (error) {
        Logger.error(`Fallo conexión Atlas: ${error.message}`);
        process.exit(1);
    }

    // 3. Migración / Sincronización
    try {
        Logger.section('PASO 3: Sincronización de Datos');
        
        const AtlasFoodTest = atlasConn.model('FoodTest', Food.schema, CONFIG.TEST_COLLECTION);
        
        // Limpiar colección de prueba previa
        Logger.info(`Limpiando colección de prueba: ${CONFIG.TEST_COLLECTION}`);
        await AtlasFoodTest.deleteMany({});
        
        if (localData.length > 0) {
            Logger.info(`Migrando ${localData.length} documentos...`);
            
            // Transformación: Eliminar _id para dejar que Atlas genere nuevos o mantenerlos si se requiere sync exacta
            // Aquí mantenemos _id para verificar integridad exacta
            
            const operations = localData.map(doc => ({
                insertOne: { document: doc }
            }));

            // Bulk Write para eficiencia
            const result = await AtlasFoodTest.bulkWrite(operations);
            stats.migratedCount = result.insertedCount;
            
            Logger.success(`Insertados: ${result.insertedCount}`);
        } else {
            Logger.warn('Saltando migración (sin datos locales)');
        }

    } catch (error) {
        Logger.error(`Error durante migración: ${error.message}`);
        stats.errors++;
    }

    // 4. Verificación de Integridad
    try {
        Logger.section('PASO 4: Verificación de Integridad');
        
        const AtlasFoodTest = atlasConn.model('FoodTest', Food.schema, CONFIG.TEST_COLLECTION);
        const atlasCount = await AtlasFoodTest.countDocuments();
        
        Logger.info(`Conteo Local: ${stats.localCount}`);
        Logger.info(`Conteo Atlas: ${atlasCount}`);
        
        if (stats.localCount === atlasCount) {
            Logger.success('VERIFICACIÓN EXITOSA: Los conteos coinciden');
        } else {
            Logger.error(`DISCREPANCIA: Faltan ${stats.localCount - atlasCount} documentos`);
            stats.errors++;
        }

        // Verificar integridad de muestra
        if (localData.length > 0) {
            const sampleLocal = localData[0];
            const sampleAtlas = await AtlasFoodTest.findOne({ _id: sampleLocal._id }).lean();
            
            if (sampleAtlas && sampleAtlas.name === sampleLocal.name) {
                Logger.success('Validación de registro individual: OK');
            } else {
                Logger.error('Validación de registro individual: FALLÓ');
                stats.errors++;
            }
        }

    } catch (error) {
        Logger.error(`Error en verificación: ${error.message}`);
        stats.errors++;
    }

    // 5. Limpieza
    try {
        Logger.section('PASO 5: Limpieza y Cierre');
        const AtlasFoodTest = atlasConn.model('FoodTest', Food.schema, CONFIG.TEST_COLLECTION);
        
        await AtlasFoodTest.collection.drop();
        Logger.success('Colección de prueba eliminada');
        
        await atlasConn.close();
        Logger.success('Conexión Atlas cerrada');
        
    } catch (error) {
        Logger.warn(`Error en limpieza: ${error.message}`);
    }

    // Reporte Final
    Logger.section('REPORTE FINAL');
    if (stats.errors === 0) {
        Logger.success('✅ PRUEBA COMPLETADA EXITOSAMENTE');
        process.exit(0);
    } else {
        Logger.error(`❌ PRUEBA FALLIDA con ${stats.errors} errores`);
        process.exit(1);
    }
}

runTest();
