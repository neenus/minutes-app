import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from './app.js';

dotenv.config({ path: './config/.env' });

mongoose.connect(process.env.MONGO_URI!);
const db = mongoose.connection;
db.once('open', () => console.log('Connected to MongoDB'));
db.on('error', (err) => console.error('MongoDB connection error:', err));

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
