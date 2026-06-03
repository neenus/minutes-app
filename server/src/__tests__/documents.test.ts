import request from 'supertest';

// Mock requireAuth to simulate unauthenticated
jest.mock('../middleware/requireAuth', () => ({
  requireAuth: (_req: any, res: any, _next: any) => {
    res.status(401).json({ success: false, error: 'Not authorized' });
  },
}));

// Mock documents.routes to use the mock version (avoids loading controller with import.meta)
jest.mock('../routes/documents.routes', () => require('../__mocks__/documents.routes'));

import { app } from '../app';

describe('Documents routes — unauthenticated', () => {
  const routes = [
    '/api/v1/documents/directors-register',
    '/api/v1/documents/officers-register',
    '/api/v1/documents/shareholders-register',
    '/api/v1/documents/shareholders-ledger',
    '/api/v1/documents/share-certificate',
    '/api/v1/documents/bank-resolution',
    '/api/v1/documents/by-laws',
    '/api/v1/documents/by-laws-2',
    '/api/v1/documents/all',
  ];

  it.each(routes)('POST %s returns 401 without token', async (route) => {
    const res = await request(app).post(route).send({});
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
