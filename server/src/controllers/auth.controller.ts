import axios from 'axios';
import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '@nr/auth-middleware';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/api/v1/auth/login`,
      req.body,
      { headers: { 'x-app-name': process.env.APP_NAME } }
    );
    res.status(200).json(response.data);
  } catch (err: any) {
    const status = err.response?.status ?? 500;
    const error = err.response?.data?.error ?? 'Login failed';
    res.status(status).json({ success: false, error });
  }
};

export const getMe = (req: AuthenticatedRequest, res: Response): void => {
  res.status(200).json({ success: true, data: { user: req.user } });
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await axios.post(
      `${process.env.AUTH_SERVICE_URL}/api/v1/auth/logout`,
      {},
      {
        headers: {
          Authorization: req.headers.authorization,
          'x-app-name': process.env.APP_NAME,
        },
      }
    );
    res.status(200).json({ success: true });
  } catch (err: any) {
    const status = err.response?.status ?? 500;
    const error = err.response?.data?.error ?? 'Logout failed';
    res.status(status).json({ success: false, error });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, currentPassword, newPassword, confirmPassword } = req.body;
    const payload: Record<string, string> = {
      firstName,
      lastName,
      email: req.user!.email,
    };
    if (currentPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
      payload.confirmPassword = confirmPassword;
    }
    const response = await axios.put(
      `${process.env.AUTH_SERVICE_URL}/api/v1/auth/profile`,
      payload,
      { headers: { Authorization: req.headers.authorization } }
    );
    res.status(200).json(response.data);
  } catch (err: any) {
    const status = err.response?.status ?? 500;
    const error = err.response?.data?.error ?? 'Failed to update profile';
    res.status(status).json({ success: false, error });
  }
};
