import request from 'supertest';
import { connectTestDb, disconnectTestDb, clearTestDb } from './helpers/mongoSetup';

jest.mock('../middleware/requireAuth', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { _id: 'u1', role: 'staff' };
    next();
  },
}));
jest.mock('../routes/documents.routes', () => require('../__mocks__/documents.routes'));

import { app } from '../app';

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
afterEach(clearTestDb);

const newCompany = {
  name: 'Test Corp Inc.',
  streetAddress: '100 King St W',
  city: 'Toronto',
  province: 'ON',
  postalCode: 'M5X 1A9',
  incorporationDate: '2024-01-15',
  certPrefix: 'ON',
  status: 'active',
};

describe('GET /api/v1/companies', () => {
  it('returns empty array when no companies exist', async () => {
    const res = await request(app).get('/api/v1/companies').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns list of companies', async () => {
    await request(app).post('/api/v1/companies').set('Authorization', 'Bearer token').send(newCompany);
    const res = await request(app).get('/api/v1/companies').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Test Corp Inc.');
  });
});

describe('POST /api/v1/companies', () => {
  it('creates a company and returns 201', async () => {
    const res = await request(app).post('/api/v1/companies').set('Authorization', 'Bearer token').send(newCompany);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Corp Inc.');
    expect(res.body.certPrefix).toBe('ON');
    expect(res.body._id).toBeDefined();
    expect(res.body.createdBy).toBe('u1');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/v1/companies').set('Authorization', 'Bearer token').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/companies/:id', () => {
  it('returns company by id', async () => {
    const created = await request(app).post('/api/v1/companies').set('Authorization', 'Bearer token').send(newCompany);
    const res = await request(app).get(`/api/v1/companies/${created.body._id}`).set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Corp Inc.');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/v1/companies/000000000000000000000000').set('Authorization', 'Bearer token');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/v1/companies/:id', () => {
  it('updates company and sets updatedBy', async () => {
    const created = await request(app).post('/api/v1/companies').set('Authorization', 'Bearer token').send(newCompany);
    const res = await request(app).put(`/api/v1/companies/${created.body._id}`)
      .set('Authorization', 'Bearer token')
      .send({ ...newCompany, name: 'Updated Corp Inc.' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Corp Inc.');
    expect(res.body.updatedBy).toBe('u1');
  });
});

describe('DELETE /api/v1/companies/:id', () => {
  it('returns 403 when role is not admin', async () => {
    const created = await request(app).post('/api/v1/companies').set('Authorization', 'Bearer token').send(newCompany);
    const res = await request(app).delete(`/api/v1/companies/${created.body._id}`).set('Authorization', 'Bearer token');
    expect(res.status).toBe(403);
  });
});
