import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { listUsers, createUser, updateUser, deleteUser, resendInvite } from '../controllers/users.controller.js';

export const usersRouter = Router();
usersRouter.use(requireAuth as any, requireRole('admin'));
usersRouter.get('/', listUsers);
usersRouter.post('/', createUser);
usersRouter.put('/:id', updateUser);
usersRouter.delete('/:id', deleteUser);
usersRouter.post('/:id/resend-invite', resendInvite);
