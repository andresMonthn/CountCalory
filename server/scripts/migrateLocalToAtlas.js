import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar Modelos
import { Food } from '../models/Food.js';
import User from '../models/User.js';
import { Entry } from '../models/Entry.js';
import Summary from '../models/Summary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const LOCAL_URI = process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/countcalory';
// Asegurar que usamos la URI de Atlas correcta
const ATLAS_URI = process.env.MONGO_URI;

if (!ATLAS_URI) {
    console.error('❌ Error: MONGO_URI (Atlas) no está definido en .env');
    process.exit(1);
}

async function migrate() {
    console.log('\n🚀 INICIANDO MIGRACIÓN: LOCAL -> ATLAS (countcalory)\n');

    let localData = {};
    let localConn;
    let atlasConn;

    // 1. LEER DATOS LOCALES
    try {
        console.log(`📥 Conectando a Local: ${LOCAL_URI}`);
        localConn = await mongoose.createConnection(LOCAL_URI, { dbName: 'countcalory' }).asPromise();
        console.log('✅ Conexión Local establecida');

        // Definir modelos en la conexión local
        const LocalUser = localConn.model('User', User.schema);
        const LocalFood = localConn.model('Food', Food.schema);
        const LocalEntry = localConn.model('Entry', Entry.schema);
        const LocalSummary = localConn.model('Summary', Summary.schema);

        console.log('📦 Extrayendo datos...');
        
        localData.users = await LocalUser.find({}).lean();
        localData.foods = await LocalFood.find({}).lean();
        localData.entries = await LocalEntry.find({}).lean();
        localData.summaries = await LocalSummary.find({}).lean();

        console.log(`   - Users: ${localData.users.length}`);
        console.log(`   - Foods: ${localData.foods.length}`);
        console.log(`   - Entries: ${localData.entries.length}`);
        console.log(`   - Summaries: ${localData.summaries.length}`);

        await localConn.close();
        console.log('🔌 Desconectado de Local\n');

    } catch (error) {
        console.error('❌ Error leyendo local:', error);
        process.exit(1);
    }

    // 2. ESCRIBIR EN ATLAS
    try {
        console.log(`📤 Conectando a Atlas...`);
        // Forzamos dbName: 'countcalory' para asegurar el destino correcto
        atlasConn = await mongoose.createConnection(ATLAS_URI, { dbName: 'countcalory' }).asPromise();
        console.log(`✅ Conexión Atlas establecida (Host: ${atlasConn.host})`);
        console.log(`📍 Base de Datos destino: ${atlasConn.name}`);

        if (atlasConn.name !== 'countcalory') {
            throw new Error(`La base de datos destino es "${atlasConn.name}", se esperaba "countcalory"`);
        }

        const AtlasUser = atlasConn.model('User', User.schema);
        const AtlasFood = atlasConn.model('Food', Food.schema);
        const AtlasEntry = atlasConn.model('Entry', Entry.schema);
        const AtlasSummary = atlasConn.model('Summary', Summary.schema);

        console.log('🧹 Limpiando colecciones en Atlas (para evitar duplicados)...');
        await AtlasUser.deleteMany({});
        await AtlasFood.deleteMany({});
        await AtlasEntry.deleteMany({});
        await AtlasSummary.deleteMany({});
        console.log('✨ Colecciones limpias');

        console.log('💾 Insertando datos en Atlas...');
        
        if (localData.users.length > 0) await AtlasUser.insertMany(localData.users);
        if (localData.foods.length > 0) await AtlasFood.insertMany(localData.foods);
        if (localData.entries.length > 0) await AtlasEntry.insertMany(localData.entries);
        if (localData.summaries.length > 0) await AtlasSummary.insertMany(localData.summaries);

        console.log('\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
        
        // Verificación rápida
        const countUsers = await AtlasUser.countDocuments();
        const countFoods = await AtlasFood.countDocuments();
        const countEntries = await AtlasEntry.countDocuments();
        const countSummaries = await AtlasSummary.countDocuments();

        console.log('\n📊 Resumen en Atlas:');
        console.log(`   - Users: ${countUsers} (Local: ${localData.users.length})`);
        console.log(`   - Foods: ${countFoods} (Local: ${localData.foods.length})`);
        console.log(`   - Entries: ${countEntries} (Local: ${localData.entries.length})`);
        console.log(`   - Summaries: ${countSummaries} (Local: ${localData.summaries.length})`);

        await atlasConn.close();

    } catch (error) {
        console.error('❌ Error escribiendo en Atlas:', error);
    }
}

migrate();
