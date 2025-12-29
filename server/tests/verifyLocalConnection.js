import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const LOCAL_URI = process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/countcalory';

async function testLocalConnection() {
    console.log('🧪 TESTING LOCAL MONGODB CONNECTION');
    console.log('===================================');
    console.log(`Target: ${LOCAL_URI}`);

    try {
        const start = Date.now();
        const conn = await mongoose.connect(LOCAL_URI, {
            serverSelectionTimeoutMS: 2000
        });
        const duration = Date.now() - start;

        console.log(`✅ Connection Successful!`);
        console.log(`⏱️  Latency: ${duration}ms`);
        console.log(`📍 Host: ${conn.connection.host}`);
        console.log(`🗄️  Database: ${conn.connection.name}`);

        // CRUD Verification
        const TestModel = mongoose.model('ConnectionTest', new mongoose.Schema({ date: Date }));
        
        // Create
        const doc = await TestModel.create({ date: new Date() });
        console.log('✅ CRUD: Create OK');
        
        // Read
        const found = await TestModel.findById(doc._id);
        if(found) console.log('✅ CRUD: Read OK');
        
        // Delete
        await TestModel.deleteMany({});
        console.log('✅ CRUD: Delete OK');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        process.exit(1);
    }
}

testLocalConnection();
