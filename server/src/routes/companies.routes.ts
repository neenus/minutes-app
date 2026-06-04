import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { listCompanies, createCompany, getCompany, updateCompany, deleteCompany } from '../controllers/companies.controller.js';

export const companiesRouter = Router();

companiesRouter.use(requireAuth);
companiesRouter.get('/', listCompanies);
companiesRouter.post('/', createCompany);
companiesRouter.get('/:id', getCompany);
companiesRouter.put('/:id', updateCompany);
companiesRouter.delete('/:id', requireRole('admin'), deleteCompany);
