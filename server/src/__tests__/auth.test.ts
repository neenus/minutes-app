import request from 'supertest';
import axios from 'axios';

jest.mock('axios');
jest.mock('../routes/documents.routes', () => require('../__mocks__/documents.routes'));

import { app } from '../app';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('POST /api/v1/auth/login', () => {
  it('returns token and user on success', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { token: 'jwt-token', user: { _id: '1', email: 'a@b.com', role: 'admin', firstName: 'A', lastName: 'B', appAccess: ['incorporate-app'], isActive: true } },
      },
    });
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'a@b.com', password: 'pass' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBe('jwt-token');
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/login'),
      { email: 'a@b.com', password: 'pass' },
      expect.objectContaining({ headers: expect.objectContaining({ 'x-app-name': expect.any(String) }) })
    );
  });

  it('returns 401 on invalid credentials', async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { status: 401, data: { error: 'Invalid credentials' } } });
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'x@y.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns 403 when user lacks app access', async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { status: 403, data: { error: 'No access' } } });
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'x@y.com', password: 'pass' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
