import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { documentsRouter } from './routes/documents.routes.js';
import { peopleRouter } from './routes/people.routes.js';
import { companiesRouter } from './routes/companies.routes.js';

dotenv.config({ path: './config/.env' });

export const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/people', peopleRouter);
app.use('/api/v1/companies', companiesRouter);
