import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Food } from '../models/Food.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const COMPOUND_FOODS = [
    {
        name: "Hamburguesa Sencilla",
        calories: 450,
        carbsG: 35,
        proteinaG: 25,
        grasasG: 22,
        categories: ["proteina", "carbs", "grasas"]
    },
    {
        name: "Pizza de Pepperoni (1 Rebanada)",
        calories: 285,
        carbsG: 30,
        proteinaG: 12,
        grasasG: 11,
        categories: ["carbs", "grasas"]
    },
    {
        name: "Quesadilla de Queso (Tortilla de Harina)",
        calories: 300,
        carbsG: 25,
        proteinaG: 12,
        grasasG: 18,
        categories: ["carbs", "grasas", "proteina"]
    },
    {
        name: "Ensalada César con Pollo",
        calories: 512, // Especificado por usuario
        carbsG: 15,
        proteinaG: 40,
        grasasG: 32,
        categories: ["proteina", "grasas"]
    },
    {
        name: "Tacos al Pastor (Orden de 3)",
        calories: 500,
        carbsG: 45,
        proteinaG: 25,
        grasasG: 25,
        categories: ["proteina", "carbs", "grasas"]
    },
    {
        name: "Sándwich de Jamón y Queso",
        calories: 350,
        carbsG: 40,
        proteinaG: 18,
        grasasG: 12,
        categories: ["carbs", "proteina"]
    },
    {
        name: "Hot Dog Sencillo",
        calories: 290,
        carbsG: 22,
        proteinaG: 10,
        grasasG: 18,
        categories: ["carbs", "grasas"]
    },
    {
        name: "Burrito de Carne y Frijoles",
        calories: 650,
        carbsG: 75,
        proteinaG: 30,
        grasasG: 25,
        categories: ["carbs", "proteina", "grasas"]
    }
];

const LOCAL_URI = process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/countcalory';
const ATLAS_URI = process.env.MONGO_URI;

async function seedDatabase(uri, name) {
    let conn;
    try {
        console.log(`\n🌱 Sembrando en ${name}...`);
        conn = await mongoose.createConnection(uri, { dbName: 'countcalory' }).asPromise();
        
        const FoodModel = conn.model('Food', Food.schema);
        
        let addedCount = 0;
        let updatedCount = 0;

        for (const food of COMPOUND_FOODS) {
            const result = await FoodModel.updateOne(
                { name: food.name },
                { $set: food },
                { upsert: true }
            );
            
            if (result.upsertedCount > 0) addedCount++;
            else if (result.modifiedCount > 0) updatedCount++;
        }

        console.log(`✅ ${name}: ${addedCount} nuevos, ${updatedCount} actualizados.`);
        await conn.close();
    } catch (error) {
        console.error(`❌ Error en ${name}:`, error.message);
        if (conn) await conn.close();
    }
}

async function run() {
    console.log('🍔 AGREGANDO ALIMENTOS COMPUESTOS (LOCAL Y ATLAS)');
    console.log('===============================================');

    // 1. Local
    await seedDatabase(LOCAL_URI, 'LOCAL');

    // 2. Atlas
    if (ATLAS_URI) {
        await seedDatabase(ATLAS_URI, 'ATLAS (NUBE)');
    } else {
        console.log('⚠️  Saltando Atlas: No se encontró MONGO_URI en .env');
    }

    console.log('\n✨ Proceso finalizado.');
}

run();
