// Mock for documents.controller.ts — avoids import.meta.url in jest (CommonJS mode)
import type { Request, Response } from 'express';

const noop = (_req: Request, res: Response) => res.status(501).json({ error: 'not implemented in tests' });

export const generateDirectorsRegister = noop;
export const generateOfficersRegister = noop;
export const generateShareholdersRegister = noop;
export const generateShareholdersLedger = noop;
export const generateShareCertificate = noop;
export const generateBankResolution = noop;
export const generateByLaws = noop;
export const generateByLaws2 = noop;
export const generateAllDocuments = noop;
