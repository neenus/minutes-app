// Mock for documents.routes.ts — avoids importing documents.controller (ESM import.meta) in jest
// Registers all 9 routes with requireAuth so auth-protection tests work correctly
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

export const documentsRouter = Router();
documentsRouter.use(requireAuth as any);

const docRoutes = [
  '/directors-register', '/officers-register', '/shareholders-register',
  '/shareholders-ledger', '/share-certificate', '/bank-resolution',
  '/by-laws', '/by-laws-2', '/all',
];
docRoutes.forEach(route => {
  documentsRouter.post(route, (_req, res) => res.status(200).json({ ok: true }));
});
