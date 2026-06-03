import request from 'supertest';
import axios from 'axios';

jest.mock('axios');
jest.mock('../routes/documents.routes', () => require('../__mocks__/documents.routes'));
jest.mock('../middleware/requireAuth', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = {
      _id: 'u1', email: 'admin@firm.com', firstName: 'Admin', lastName: 'User',
      role: 'admin', appAccess: ['incorporate-app'], isActive: true,
    };
    next();
  },
}));

import { app } from '../app';

const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockUsers = [
  { _id: 'u1', email: 'admin@firm.com', firstName: 'Admin', lastName: 'User', role: 'admin' },
  { _id: 'u2', email: 'staff@firm.com', firstName: 'Staff', lastName: 'User', role: 'staff' },
];

describe('GET /api/v1/users', () => {
  it('returns list of users for admin', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: mockUsers } });
    const res = await request(app).get('/api/v1/users').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });
});

describe('GET /api/v1/users — staff blocked', () => {
  it('returns 403 when role is staff', async () => {
    const express2 = require('express');
    const { requireRole } = require('../middleware/requireRole');
    const staffApp = express2();
    staffApp.get('/test', (req: any, _res: any, next: any) => { req.user = { role: 'staff' }; next(); }, requireRole('admin'), (_req: any, res: any) => res.json({ ok: true }));
    const res = await request(staffApp).get('/test');
    expect(res.status).toBe(403);
  });
});

describe('POST /api/v1/users', () => {
  it('creates a user and returns 201', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true, data: { _id: 'u3', email: 'new@firm.com' } } });
    const res = await request(app).post('/api/v1/users').set('Authorization', 'Bearer token').send({ email: 'new@firm.com', firstName: 'New', lastName: 'User', role: 'staff' });
    expect(res.status).toBe(201);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/users'),
      expect.any(Object),
      expect.objectContaining({ headers: expect.objectContaining({ 'X-API-Key': expect.anything() }) })
    );
  });
});

describe('PUT /api/v1/users/:id', () => {
  it('updates a user', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: { success: true } });
    const res = await request(app).put('/api/v1/users/u2').set('Authorization', 'Bearer token').send({ role: 'admin' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/v1/users/:id', () => {
  it('deactivates a user', async () => {
    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });
    const res = await request(app).delete('/api/v1/users/u2').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
  });
});

describe('POST /api/v1/users/:id/resend-invite', () => {
  it('resends invite', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
    const res = await request(app).post('/api/v1/users/u2/resend-invite').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
  });
});
