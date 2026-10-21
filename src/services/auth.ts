import { api } from './api';
import type { LoginResponse, Role, User } from '../types';

const useMock = import.meta.env.VITE_USE_MOCK_API !== 'false';
const USER_KEY = 'mro_user';

const accounts: Array<User & { password: string }> = [
  { id: 'USR-REPORTER-1', email: 'reporter1@kal.test', password: 'test1234', name: '김민지', role: 'REPORTER', airline_code: 'KAL' },
  { id: 'USR-MAINT-1', email: 'hyd1@mro.test', password: 'test1234', name: '박정우', role: 'MAINTENANCE', department_code: 'HYD' },
  { id: 'USR-ADMIN-1', email: 'admin@mro.test', password: 'test1234', name: '이주영', role: 'ADMIN' }
];

export function currentUser(): User | null {
  const stored = sessionStorage.getItem(USER_KEY);
  if (!stored) return null;
  try { return JSON.parse(stored) as User; } catch { return null; }
}

export function homeForRole(role: Role) {
  return role === 'REPORTER' ? '/reporter' : role === 'MAINTENANCE' ? '/maintenance' : '/admin';
}

export async function signIn(email: string, password: string): Promise<User> {
  let response: LoginResponse;
  if (useMock) {
    const account = accounts.find(item => item.email === email && item.password === password);
    if (!account) throw new Error('INVALID_CREDENTIALS');
    const { password: _, ...user } = account;
    response = { access_token: `mock-${user.id}`, token_type: 'bearer', expires_in: 28800, user };
  } else {
    response = await api.login(email, password);
  }
  sessionStorage.setItem('access_token', response.access_token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(response.user));
  return response.user;
}

export function signOut() {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem(USER_KEY);
}
