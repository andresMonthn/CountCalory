import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Food } from '../models/Food.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const LOCAL_URI = process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/countcalory';
const ATLAS_URI = process.env.MONGO_URI;

async function checkFood(uri, envName) {
    let conn;
    try {
        conn = await mongoose.createConnection(uri, { dbName: 'countcalory' }).asPromise();
        const FoodModel = conn.model('Food', Food.schema);
        
        console.log(`\n🔍 Verificando en ${envName}:`);
        
        const foodsToCheck = ["Hamburguesa Sencilla", "Ensalada César con Pollo", "Pizza de Pepperoni (1 Rebanada)"];
        
        for (const name of foodsToCheck) {
            const food = await FoodModel.findOne({ name: name }).lean();
            if (food) {
                console.log(`   ✅ Encontrado: ${food.name.padEnd(35)} | ${food.calories} kcal | P:${food.proteinaG}g C:${food.carbsG}g G:${food.grasasG}g`);
            } else {
                console.log(`   ❌ FALTANTE: ${name}`);
            }
        }
        await conn.close();
    } catch (err) {
        console.error(`Error en ${envName}:`, err);
    }
}

async function verify() {
    await checkFood(LOCAL_URI, "LOCAL");
    await checkFood(ATLAS_URI, "ATLAS");
}

verify();
