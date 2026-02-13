import fetch from 'node-fetch'; // or built-in
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:4000/api';
// Use local URI if available, or fallback to Atlas if configured in .env
const MONGO_URI = process.env.MONGODB_URI_LOCAL || process.env.MONGODB_URI;

// Define User Schema minimal for query
const userSchema = new mongoose.Schema({
    email: String,
    loginToken: String
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function runTests() {
    console.log("🚀 Iniciando pruebas de API en", BASE_URL);

    // 0. Connect to DB to retrieve tokens
    try {
        if (!MONGO_URI) throw new Error("MONGODB_URI not found in .env");
        await mongoose.connect(MONGO_URI);
        console.log("📦 Connected to MongoDB for verification");
    } catch (e) {
        console.error("❌ MongoDB Connection Error:", e.message);
        console.log("   Cannot retrieve magic token without DB access.");
        return;
    }

    // 1. Health Check
    try {
        const res = await fetch(BASE_URL);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        console.log("✅ API Health Check: OK");
    } catch (e) {
        console.error("❌ API Health Check: FALLÓ", e.message);
        return;
    }

    // 2. Auth Flow (Magic Link)
    const testEmail = `test_${Date.now()}@example.com`;
    let jwtToken = '';

    try {
        console.log(`\n👤 Solicitando Login (Magic Link) para: ${testEmail}`);
        // Login/Register
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail })
        });
        
        if (!loginRes.ok) {
            const err = await loginRes.json();
            throw new Error(`Login Request Failed: ${JSON.stringify(err)}`);
        }
        console.log("✅ Solicitud de login enviada.");

        // Retrieve token from DB
        console.log("🔍 Buscando token mágico en DB...");
        // Wait a bit for DB propagation if needed
        await new Promise(r => setTimeout(r, 1000));
        
        const user = await User.findOne({ email: testEmail });
        if (!user || !user.loginToken) {
            throw new Error("User or loginToken not found in DB");
        }
        const magicToken = user.loginToken;
        console.log(`✅ Token mágico encontrado: ${magicToken.substring(0, 5)}...`);

        // Verify Token
        console.log("🔐 Verificando token...");
        const verifyRes = await fetch(`${BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, token: magicToken })
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
            throw new Error(`Verification Failed: ${JSON.stringify(verifyData)}`);
        }

        jwtToken = verifyData.token;
        console.log("✅ Autenticación exitosa. JWT recibido.");

    } catch (e) {
        console.error("❌ Auth Error:", e.message);
        await mongoose.disconnect();
        return;
    }

    // 3. Test Metrics Endpoint
    try {
        console.log("\n📊 Probando GET /user/metrics...");
        const res = await fetch(`${BASE_URL}/user/metrics`, {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        
        const data = await res.json();
        if (!res.ok) {
            throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
        }
        console.log("✅ Métricas obtenidas correctamente:");
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("❌ Metrics Error:", e.message);
    }

    // 4. Test Summary History Endpoint
    try {
        console.log("\n📅 Probando GET /summary...");
        const res = await fetch(`${BASE_URL}/summary`, {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        
        const data = await res.json();
        if (!res.ok) {
            throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
        }
        console.log(`✅ Historial de resúmenes obtenido. Total: ${data.length}`);
    } catch (e) {
        console.error("❌ Summary History Error:", e.message);
    }

    await mongoose.disconnect();
    console.log("\n🏁 Pruebas finalizadas.");
}

// Check if node version supports fetch
if (!globalThis.fetch) {
    console.error("❌ Este script requiere Node.js 18+");
    process.exit(1);
}

runTests();
