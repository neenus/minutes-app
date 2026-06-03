// server/src/routes/documents.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  generateDirectorsRegister, generateOfficersRegister,
  generateShareholdersRegister, generateShareholdersLedger,
  generateShareCertificate, generateBankResolution,
  generateByLaws, generateByLaws2, generateAllDocuments,
} from '../controllers/documents.controller.js';

export const documentsRouter = Router();
documentsRouter.use(requireAuth);
documentsRouter.post('/directors-register', generateDirectorsRegister);
documentsRouter.post('/officers-register', generateOfficersRegister);
documentsRouter.post('/shareholders-register', generateShareholdersRegister);
documentsRouter.post('/shareholders-ledger', generateShareholdersLedger);
documentsRouter.post('/share-certificate', generateShareCertificate);
documentsRouter.post('/bank-resolution', generateBankResolution);
documentsRouter.post('/by-laws', generateByLaws);
documentsRouter.post('/by-laws-2', generateByLaws2);
documentsRouter.post('/all', generateAllDocuments);
