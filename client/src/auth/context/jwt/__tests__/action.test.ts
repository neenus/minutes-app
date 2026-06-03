import { beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted to define mocks before module hoisting
const hoisted = vi.hoisted(() => {
  const defaults = {
    headers: {
      common: {} as Record<string, string | undefined>,
    },
  };
  const post = vi.fn();
  return { post, defaults };
});

vi.mock('src/lib/axios', () => ({
  default: {
    post: hoisted.post,
    defaults: hoisted.defaults,
  },
}));

vi.mock('../utils', async () => {
  const { JWT_STORAGE_KEY } = await import('../constant');
  return {
    JWT_STORAGE_KEY,
    setSession: (token: string | null) => {
      if (token) {
        localStorage.setItem(JWT_STORAGE_KEY, token);
        hoisted.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem(JWT_STORAGE_KEY);
        delete hoisted.defaults.headers.common['Authorization'];
      }
    },
    getStoredToken: () => localStorage.getItem(JWT_STORAGE_KEY),
    isValidToken: vi.fn(() => true),
  };
});

import { signInWithPassword, signOut } from '../action';

beforeEach(() => {
  localStorage.clear();
  hoisted.defaults.headers.common = {};
  hoisted.post.mockReset();
});

describe('signInWithPassword', () => {
  it('stores token in localStorage and sets axios header on success', async () => {
    hoisted.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          token: 'test-jwt',
          user: {
            _id: '1',
            email: 'a@b.com',
            role: 'admin',
            firstName: 'A',
            lastName: 'B',
            appAccess: ['incorporate-app'],
            isActive: true,
          },
        },
      },
    });

    await signInWithPassword({ email: 'a@b.com', password: 'pass' });

    expect(localStorage.getItem('jwt_access_token')).toBe('test-jwt');
    expect(hoisted.defaults.headers.common['Authorization']).toBe('Bearer test-jwt');
  });

  it('throws on error response', async () => {
    hoisted.post.mockRejectedValueOnce(new Error('Network error'));
    await expect(signInWithPassword({ email: 'x@y.com', password: 'bad' })).rejects.toThrow();
  });
});

describe('signOut', () => {
  it('clears localStorage and axios header', () => {
    localStorage.setItem('jwt_access_token', 'some-token');
    hoisted.defaults.headers.common['Authorization'] = 'Bearer some-token';

    signOut();

    expect(localStorage.getItem('jwt_access_token')).toBeNull();
    expect(hoisted.defaults.headers.common['Authorization']).toBeUndefined();
  });
});
