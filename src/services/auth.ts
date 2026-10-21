import { api } from './api';
import type { LoginResponse, Role, User } from '../types';

const USER_KEY = 'mro_user';

export function currentUser(): User | null {
  const stored = sessionStorage.getItem(USER_KEY);
  if (!stored) return null;
  try { return JSON.parse(stored) as User; } catch { return null; }
}

export function homeForRole(role: Role) {
  return role === 'REPORTER' ? '/reporter' : role === 'MAINTENANCE' ? '/maintenance' : '/admin';
}

function store(response: LoginResponse): User {
  sessionStorage.setItem('access_token', response.access_token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(response.user));
  return response.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  return store(await api.login(email.trim(), password));
}

/** 신고자 가입. 성공하면 바로 로그인 상태가 됩니다. */
export async function signUp(body: { email: string; password: string; name: string; airline_code: string }): Promise<User> {
  return store(await api.signup({ ...body, email: body.email.trim(), name: body.name.trim() }));
}

export function signOut() {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem(USER_KEY);
}
