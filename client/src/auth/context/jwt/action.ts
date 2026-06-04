import axios from 'src/lib/axios';

import { setSession } from './utils';
import { JWT_USER_KEY } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  const response = await axios.post('/api/v1/auth/login', { email, password });
  const { token, user } = response.data?.data ?? {};

  if (!token || !user) {
    throw new Error('Invalid response from auth service');
  }

  setSession(token);
  localStorage.setItem(JWT_USER_KEY, JSON.stringify(user));
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = (): void => {
  setSession(null);
  localStorage.removeItem(JWT_USER_KEY);
};
