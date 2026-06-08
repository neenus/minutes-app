import request from 'supertest';
import axios from 'axios';

jest.mock('axios');
jest.mock('../routes/documents.routes', () => require('../__mocks__/documents.routes'));
jest.mock('../middleware/requireAuth', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = {
      _id: 'u1', email: 'user@firm.com', firstName: 'John', lastName: 'Doe',
      role: 'staff', appAccess: ['minutes-app'], isActive: true,
    };
    next();
  },
}));

import { app } from '../app';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('POST /api/v1/auth/login', () => {
  it('returns token and user on success', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { token: 'jwt-token', user: { _id: '1', email: 'a@b.com', role: 'admin', firstName: 'A', lastName: 'B', appAccess: ['minutes-app'], isActive: true } },
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

describe('GET /api/v1/auth/me', () => {
  it('returns the authenticated user', async () => {
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('user@firm.com');
    expect(res.body.data.user.role).toBe('staff');
  });
});

describe('PUT /api/v1/auth/profile', () => {
  it('proxies name update using authenticated user email, ignoring body email', async () => {
    mockedAxios.put.mockResolvedValueOnce({
      data: { success: true, data: { user: { firstName: 'Jane', lastName: 'Doe', email: 'user@firm.com' } } },
    });

    const res = await request(app)
      .put('/api/v1/auth/profile')
      .set('Authorization', 'Bearer token')
      .send({ firstName: 'Jane', lastName: 'Doe', email: 'hacker@evil.com' });

    expect(res.status).toBe(200);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/profile'),
      expect.objectContaining({ firstName: 'Jane', lastName: 'Doe', email: 'user@firm.com' }),
      expect.any(Object)
    );
  });

  it('proxies password change to nr-auth', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: { success: true, data: { user: {} } } });

    const res = await request(app)
      .put('/api/v1/auth/profile')
      .set('Authorization', 'Bearer token')
      .send({ firstName: 'John', lastName: 'Doe', currentPassword: 'old', newPassword: 'new12345', confirmPassword: 'new12345' });

    expect(res.status).toBe(200);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/profile'),
      expect.objectContaining({ currentPassword: 'old', newPassword: 'new12345', confirmPassword: 'new12345' }),
      expect.any(Object)
    );
  });

  it('returns error when nr-auth rejects (wrong current password)', async () => {
    mockedAxios.put.mockRejectedValueOnce({ response: { status: 400, data: { error: 'Current password is incorrect' } } });

    const res = await request(app)
      .put('/api/v1/auth/profile')
      .set('Authorization', 'Bearer token')
      .send({ firstName: 'John', lastName: 'Doe', currentPassword: 'wrong', newPassword: 'new12345', confirmPassword: 'new12345' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Current password is incorrect');
  });
});
