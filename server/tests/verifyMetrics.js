import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Summary from '../models/Summary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const URI = process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/countcalory';

async function testMetrics() {
    console.log('🧪 PROBANDO ENDPOINT DE MÉTRICAS (Simulación)');
    
    try {
        await mongoose.connect(URI, { dbName: 'countcalory' });
        
        // 1. Buscar un usuario de prueba
        const user = await User.findOne();
        if (!user) throw new Error('No hay usuarios en la BD');
        
        console.log(`👤 Usuario de prueba: ${user.email} (${user._id})`);

        // 2. Simular lógica del controlador
        const userId = user._id;

        // Count
        const summariesCount = await Summary.countDocuments({ userId });
        console.log(`📊 Total Resúmenes: ${summariesCount}`);

        // Aggregation
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyActivityRaw = await Summary.aggregate([
            { 
                $match: { 
                    userId: userId, 
                    createdAt: { $gte: sixMonthsAgo } 
                } 
            },
            {
                $group: {
                    _id: { 
                        month: { $month: "$createdAt" }, 
                        year: { $year: "$createdAt" } 
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        console.log('📅 Actividad Mensual (Raw):', JSON.stringify(monthlyActivityRaw, null, 2));

        const monthlyActivity = monthlyActivityRaw.map(item => {
            const date = new Date(item._id.year, item._id.month - 1);
            return {
                month: date.toLocaleString('es-ES', { month: 'short' }),
                year: item._id.year,
                count: item.count
            };
        });

        console.log('✅ Actividad Formateada:', monthlyActivity);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testMetrics();
