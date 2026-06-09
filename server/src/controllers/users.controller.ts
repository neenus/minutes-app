import axios from 'axios';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '@nr/auth-middleware';

const nrAuthUrl = () => process.env.AUTH_SERVICE_URL;
const apiKey = () => process.env.AUTH_API_KEY;

const actorHeaders = (req: AuthenticatedRequest) => ({
  'X-API-Key': apiKey(),
  'X-Actor-ID': req.user?._id,
  'X-Actor-Email': req.user?.email,
  'X-Actor-Name': `${req.user?.firstName ?? ''} ${req.user?.lastName ?? ''}`.trim(),
  'x-app-name': process.env.APP_NAME,
});

export const listUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data } = await axios.get(`${nrAuthUrl()}/api/v1/users`, { headers: { 'X-API-Key': apiKey(), 'x-app-name': process.env.APP_NAME } });
    const users = data?.data?.users ?? [];
    res.json({ success: true, data: { users } });
  } catch (err: any) {
    res.status(err.response?.status ?? 500).json({ success: false, error: err.response?.data?.error ?? 'Failed to fetch users' });
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const appName = process.env.APP_NAME!;
    const appAccess = Array.isArray(req.body.appAccess) ? req.body.appAccess : [];
    const body = { ...req.body, appAccess: [...new Set([...appAccess, appName])] };
    const { data } = await axios.post(`${nrAuthUrl()}/api/v1/users`, body, { headers: actorHeaders(req) });
    res.status(201).json(data);
  } catch (err: any) {
    res.status(err.response?.status ?? 500).json({ success: false, error: err.response?.data?.error ?? 'Failed to create user' });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data } = await axios.put(`${nrAuthUrl()}/api/v1/users/${req.params.id}`, req.body, { headers: actorHeaders(req) });
    res.json(data);
  } catch (err: any) {
    res.status(err.response?.status ?? 500).json({ success: false, error: err.response?.data?.error ?? 'Failed to update user' });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data } = await axios.delete(`${nrAuthUrl()}/api/v1/users/${req.params.id}`, { headers: actorHeaders(req) });
    res.json(data);
  } catch (err: any) {
    res.status(err.response?.status ?? 500).json({ success: false, error: err.response?.data?.error ?? 'Failed to deactivate user' });
  }
};

export const resendInvite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data } = await axios.post(`${nrAuthUrl()}/api/v1/users/${req.params.id}/resend-invite`, {}, { headers: actorHeaders(req) });
    res.json(data);
  } catch (err: any) {
    res.status(err.response?.status ?? 500).json({ success: false, error: err.response?.data?.error ?? 'Failed to resend invite' });
  }
};
