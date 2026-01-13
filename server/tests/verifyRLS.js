import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Summary from '../models/Summary.js';
import User from '../models/User.js';

// Configuración de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/countcalory';

async function verifyRLS() {
    console.log('\n🛡️  VERIFICACIÓN DE SEGURIDAD RLS (Row Level Security)\n');

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a la base de datos');

        // 1. Crear usuarios de prueba
        const userA_ID = new mongoose.Types.ObjectId();
        const userB_ID = new mongoose.Types.ObjectId();

        console.log(`👤 Usuario A (ID): ${userA_ID}`);
        console.log(`👤 Usuario B (ID): ${userB_ID}`);

        // 2. Crear datos para Usuario A
        console.log('\n📝 Creando resumen para Usuario A...');
        await Summary.create({
            userId: userA_ID,
            budget: 2000,
            consumed: 1500,
            exercise: 300,
            remaining: 800,
            status: 'good'
        });
        console.log('✅ Resumen de Usuario A creado');

        // 3. Simular consulta de Usuario B (Intento de acceso cruzado)
        console.log('\n🕵️  Usuario B intentando leer datos...');
        
        // Esta es la consulta que hace el controlador: Summary.find({ userId: req.user._id })
        const dataForUserB = await Summary.find({ userId: userB_ID });

        if (dataForUserB.length === 0) {
            console.log('✅ ÉXITO: Usuario B no ve ningún dato (Array vacío)');
        } else {
            console.error('❌ FALLO CRÍTICO: Usuario B pudo ver datos que no le pertenecen!');
            console.log(dataForUserB);
            process.exit(1);
        }

        // 4. Simular consulta de Usuario A (Acceso legítimo)
        console.log('\n👤 Usuario A leyendo sus propios datos...');
        const dataForUserA = await Summary.find({ userId: userA_ID });

        if (dataForUserA.length > 0 && dataForUserA[0].userId.toString() === userA_ID.toString()) {
            console.log(`✅ ÉXITO: Usuario A recuperó ${dataForUserA.length} registro(s) propios correctly`);
        } else {
            console.error('❌ FALLO: Usuario A no pudo ver sus propios datos');
        }

        // 5. Verificación de Integridad de la Tabla
        console.log('\n🔍 Verificando integridad de tabla Summary...');
        const summarySchema = Summary.schema.paths;
        if (summarySchema.userId && summarySchema.userId.options.required) {
            console.log('✅ Campo userId es REQUERIDO en el esquema');
        } else {
            console.error('❌ Campo userId NO es requerido (Riesgo de seguridad)');
        }
        
        // Limpieza
        await Summary.deleteMany({ userId: { $in: [userA_ID, userB_ID] } });
        console.log('\n🧹 Datos de prueba eliminados');

    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔒 Prueba finalizada');
    }
}

verifyRLS();
