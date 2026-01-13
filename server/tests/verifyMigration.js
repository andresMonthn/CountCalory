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
const ATLAS_URI = process.env.MONGO_URI;

async function verifyMigration() {
    console.log('\n🧪 VERIFICACIÓN DE INTEGRIDAD DE DATOS (LOCAL vs ATLAS)\n');

    let localConn, atlasConn;

    try {
        // Conexiones Paralelas
        console.log('⏳ Estableciendo conexiones...');
        const [localMongoose, atlasMongoose] = await Promise.all([
            mongoose.createConnection(LOCAL_URI, { dbName: 'countcalory' }).asPromise(),
            mongoose.createConnection(ATLAS_URI, { dbName: 'countcalory' }).asPromise()
        ]);
        
        localConn = localMongoose;
        atlasConn = atlasMongoose;
        console.log('✅ Ambas bases de datos conectadas');

        const models = [
            { name: 'User', schema: User.schema },
            { name: 'Food', schema: Food.schema },
            { name: 'Entry', schema: Entry.schema },
            { name: 'Summary', schema: Summary.schema }
        ];

        console.log('\n📊 COMPARACIÓN DE CONTEOS:');
        console.log('--------------------------------------------------');
        console.log(' Colección      | Local | Atlas | Estado');
        console.log('--------------------------------------------------');

        for (const m of models) {
            const LocalModel = localConn.model(m.name, m.schema);
            const AtlasModel = atlasConn.model(m.name, m.schema);

            const countLocal = await LocalModel.countDocuments();
            const countAtlas = await AtlasModel.countDocuments();
            
            const status = countLocal === countAtlas ? '✅ OK' : '❌ DESIGUAL';
            console.log(` ${m.name.padEnd(14)} | ${countLocal.toString().padEnd(5)} | ${countAtlas.toString().padEnd(5)} | ${status}`);

            // Verificación de Muestra (si hay datos)
            if (countLocal > 0) {
                const sampleLocal = await LocalModel.findOne().lean();
                // Buscar por ID para asegurar que es el mismo documento
                const sampleAtlas = await AtlasModel.findById(sampleLocal._id).lean();

                if (!sampleAtlas) {
                    console.error(`   ❌ Error: Documento de muestra ${m.name} no encontrado en Atlas`);
                } else {
                    // Comparar un campo clave
                    const keys = Object.keys(sampleLocal).filter(k => k !== '_id' && k !== '__v');
                    if (keys.length > 0) {
                        const key = keys[0];
                        const valLocal = JSON.stringify(sampleLocal[key]);
                        const valAtlas = JSON.stringify(sampleAtlas[key]);
                        
                        if (valLocal !== valAtlas) {
                             console.warn(`   ⚠️  Advertencia: Diferencia en campo '${key}' (Local: ${valLocal} vs Atlas: ${valAtlas})`);
                        }
                    }
                }
            }
        }
        console.log('--------------------------------------------------');
        console.log('\n✨ Verificación finalizada.');

    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
    } finally {
        if (localConn) await localConn.close();
        if (atlasConn) await atlasConn.close();
    }
}

verifyMigration();
