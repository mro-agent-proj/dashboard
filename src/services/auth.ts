import { api } from './api';
import type { Role, User } from '../types';

const USER_KEY = 'mro_user';

export function currentUser(): User | null {
  const stored = sessionStorage.getItem(USER_KEY);
  if (!stored) return null;
  try { return JSON.parse(stored) as User; } catch { return null; }
}

export function homeForRole(role: Role) {
  return role === 'REPORTER' ? '/reporter' : role === 'MAINTENANCE' ? '/maintenance' : '/admin';
}

export async function signIn(email: string, password: string): Promise<User> {
  const response = await api.login(email, password);
  sessionStorage.setItem('access_token', response.access_token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(response.user));
  return response.user;
}

export function signOut() {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem(USER_KEY);
}
