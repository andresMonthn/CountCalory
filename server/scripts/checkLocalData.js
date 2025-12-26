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

async function checkData() {
    try {
        console.log('Connecting to Local DB:', LOCAL_URI);
        const conn = await mongoose.connect(LOCAL_URI);
        
        const foods = await Food.countDocuments();
        const users = await User.countDocuments();
        const entries = await Entry.countDocuments();
        const summaries = await Summary.countDocuments();
        
        console.log('\n📊 LOCAL DATA STATUS:');
        console.log(`- Foods: ${foods}`);
        console.log(`- Users: ${users}`);
        console.log(`- Entries: ${entries}`);
        console.log(`- Summaries: ${summaries}`);
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error checking data:', error);
    }
}

checkData();
