import { Router } from 'express';
import { login, getMe, updateProfile } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const authRouter = Router();
authRouter.post('/login', login);
authRouter.get('/me', requireAuth as any, getMe);
authRouter.put('/profile', requireAuth as any, updateProfile);
