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

describe('GET /api/v1/people', () => {
  it('returns empty array when no people exist', async () => {
    const res = await request(app).get('/api/v1/people').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('searches people by name case-insensitively', async () => {
    await request(app).post('/api/v1/people').set('Authorization', 'Bearer token')
      .send({ name: 'Jane Smith', streetAddress: '123 Main St', city: 'Toronto', province: 'ON', postalCode: 'M5V 2T6' });
    await request(app).post('/api/v1/people').set('Authorization', 'Bearer token')
      .send({ name: 'John Doe', streetAddress: '456 Queen St', city: 'Toronto', province: 'ON', postalCode: 'M4C 1T8' });
    const res = await request(app).get('/api/v1/people?q=jane').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Jane Smith');
  });
});

describe('POST /api/v1/people', () => {
  it('creates a person with 4-field address', async () => {
    const res = await request(app).post('/api/v1/people').set('Authorization', 'Bearer token')
      .send({ name: 'Jane Smith', streetAddress: '123 Main St', city: 'Toronto', province: 'ON', postalCode: 'M5V 2T6' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Jane Smith');
    expect(res.body.city).toBe('Toronto');
    expect(res.body._id).toBeDefined();
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/v1/people').set('Authorization', 'Bearer token')
      .send({ streetAddress: '123 Main St' });
    expect(res.status).toBe(400);
  });
});
