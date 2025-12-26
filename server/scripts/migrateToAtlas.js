import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Food } from '../models/Food.js';
import User from '../models/User.js';
import { Entry } from '../models/Entry.js';
import Summary from '../models/Summary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const LOCAL_URI = process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/countcalory';
const ATLAS_URI = process.env.MONGO_URI;

if (!ATLAS_URI) {
    console.error('❌ Error: MONGO_URI (Atlas) is not defined in .env');
    process.exit(1);
}

// Utility to handle bulk upsert
async function migrateCollection(sourceModel, targetModel, name) {
    console.log(`\n📦 Migrating collection: ${name}...`);
    
    const count = await sourceModel.countDocuments();
    if (count === 0) {
        console.log(`   ⚠️ No documents found in local ${name}. Skipping.`);
        return;
    }

    console.log(`   📥 Fetching ${count} documents from Local...`);
    const docs = await sourceModel.find().lean();

    console.log(`   📤 Uploading to Atlas...`);
    
    // Prepare bulk operations
    const operations = docs.map(doc => ({
        replaceOne: {
            filter: { _id: doc._id },
            replacement: doc,
            upsert: true
        }
    }));

    // Execute in batches of 500 to avoid memory issues or limits
    const BATCH_SIZE = 500;
    let successCount = 0;

    for (let i = 0; i < operations.length; i += BATCH_SIZE) {
        const batch = operations.slice(i, i + BATCH_SIZE);
        const result = await targetModel.bulkWrite(batch);
        successCount += (result.modifiedCount + result.upsertedCount + result.insertedCount || batch.length); // Approximate success tracking
        process.stdout.write(`   ⏳ Processed ${Math.min(i + BATCH_SIZE, count)}/${count}\r`);
    }
    
    console.log(`   ✅ Migration of ${name} completed.`);
}

async function runMigration() {
    console.log('🚀 STARTING MIGRATION: LOCAL -> ATLAS');
    console.log('=======================================');

    let localConn, atlasConn;

    try {
        // 1. Establish Connections
        console.log('🔌 Connecting to Local DB...');
        localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log('   ✅ Local connected');

        console.log('🔌 Connecting to Atlas DB...');
        atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
        console.log('   ✅ Atlas connected');

        // 2. Define Models on connections
        // We need to register models on specific connections to ensure we read/write from correct DBs
        const LocalFood = localConn.model('Food', Food.schema);
        const AtlasFood = atlasConn.model('Food', Food.schema);

        const LocalUser = localConn.model('User', User.schema);
        const AtlasUser = atlasConn.model('User', User.schema);

        const LocalEntry = localConn.model('Entry', Entry.schema);
        const AtlasEntry = atlasConn.model('Entry', Entry.schema);

        const LocalSummary = localConn.model('Summary', Summary.schema);
        const AtlasSummary = atlasConn.model('Summary', Summary.schema);

        // 3. Perform Migrations
        await migrateCollection(LocalFood, AtlasFood, 'Foods');
        await migrateCollection(LocalUser, AtlasUser, 'Users');
        await migrateCollection(LocalEntry, AtlasEntry, 'Entries');
        await migrateCollection(LocalSummary, AtlasSummary, 'Summaries');

        console.log('\n=======================================');
        console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY');
        
    } catch (error) {
        console.error('\n❌ MIGRATION FAILED:', error);
    } finally {
        if (localConn) await localConn.close();
        if (atlasConn) await atlasConn.close();
        process.exit(0);
    }
}

runMigration();
