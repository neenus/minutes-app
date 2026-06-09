import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Company } from '../models/Company.js';
import { AuditLog } from '../models/AuditLog.js';

function userId(req: Request): string {
  return (req as any).user?._id?.toString() || 'unknown';
}

function errorStatus(err: unknown): number {
  if (err instanceof mongoose.Error.ValidationError) return 400;
  if (err instanceof mongoose.Error.CastError) return 400;
  return 500;
}

export async function listCompanies(_req: Request, res: Response) {
  try {
    const companies = await Company.find({})
      .select('name incorporationDate status dissolvedAt shareholders createdBy updatedBy updatedAt')
      .lean();
    res.json(companies);
  } catch (err) {
    res.status(errorStatus(err)).json({ error: 'Failed to list companies' });
  }
}

export async function createCompany(req: Request, res: Response) {
  try {
    const uid = userId(req);
    const company = await Company.create({ ...req.body, createdBy: uid, updatedBy: uid });
    await AuditLog.create({ companyId: company._id, userId: uid, action: 'created', summary: `Created company ${company.name}` });
    res.status(201).json(company);
  } catch (err) {
    res.status(errorStatus(err)).json({ error: 'Failed to create company' });
  }
}

export async function getCompany(req: Request, res: Response) {
  try {
    const company = await Company.findById(req.params.id)
      .populate('people')
      .populate('shareholders.personId')
      .populate('directors.personId')
      .populate('officers.personId')
      .populate('banking.signatories.personId')
      .lean();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (err) {
    res.status(errorStatus(err)).json({ error: 'Failed to get company' });
  }
}

export async function updateCompany(req: Request, res: Response) {
  try {
    const uid = userId(req);
    // Strip fields the client must never control
    const { createdBy: _c, _id: _i, __v: _v, _auditSummary, ...safeBody } = req.body;
    const auditSummary = typeof _auditSummary === 'string' ? _auditSummary.slice(0, 200) : 'Updated company';
    // Filter out incomplete signatories (empty personId would fail ObjectId cast)
    if (safeBody.banking?.signatories) {
      safeBody.banking.signatories = safeBody.banking.signatories.filter((s: any) => s.personId);
    }
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { ...safeBody, updatedBy: uid },
      { new: true, runValidators: true }
    )
      .populate('people')
      .populate('shareholders.personId')
      .populate('directors.personId')
      .populate('officers.personId')
      .populate('banking.signatories.personId');
    if (!company) return res.status(404).json({ error: 'Company not found' });
    await AuditLog.create({ companyId: company._id, userId: uid, action: 'updated', summary: auditSummary });
    res.json(company);
  } catch (err) {
    res.status(errorStatus(err)).json({ error: 'Failed to update company' });
  }
}

export async function deleteCompany(req: Request, res: Response) {
  try {
    const uid = userId(req);
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    await AuditLog.create({ companyId: company._id, userId: uid, action: 'deleted', summary: `Deleted company ${company.name}` });
    res.json({ message: 'Company deleted' });
  } catch (err) {
    res.status(errorStatus(err)).json({ error: 'Failed to delete company' });
  }
}
