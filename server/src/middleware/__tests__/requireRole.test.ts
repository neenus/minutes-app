import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '@nr/auth-middleware';
import { requireRole } from '../requireRole';

const mockNext = jest.fn() as unknown as NextFunction;
const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;

beforeEach(() => jest.clearAllMocks());

describe('requireRole', () => {
  it('calls next when user has matching role', () => {
    const req = { user: { role: 'admin' } } as AuthenticatedRequest;
    requireRole('admin')(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('returns 403 when user has wrong role', () => {
    const req = { user: { role: 'staff' } } as AuthenticatedRequest;
    requireRole('admin')(req, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Forbidden' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns 403 when user is undefined', () => {
    const req = {} as AuthenticatedRequest;
    requireRole('admin')(req, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('accepts any of multiple roles', () => {
    const req = { user: { role: 'staff' } } as AuthenticatedRequest;
    requireRole('admin', 'staff')(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('rejects a role not in the allowed list', () => {
    const req = { user: { role: 'guest' } } as AuthenticatedRequest;
    requireRole('admin', 'staff')(req, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
  });
});
