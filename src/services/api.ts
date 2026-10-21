import axios from 'axios';
import type { LoginResponse, Page, RepairRequest, ReviewItem, Trace, User } from '../types';

const http = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1', timeout: 10000 });
http.interceptors.request.use(config => {
  const token = sessionStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
http.interceptors.response.use(r => r, error => {
  if (error.response?.status === 401) { sessionStorage.clear(); location.href = '/login'; }
  return Promise.reject(error);
});

export const api = {
  login: (email: string, password: string) => http.post<LoginResponse>('/auth/login', { email, password }).then(r => r.data),
  me: () => http.get<User>('/me').then(r => r.data),
  departments: () => http.get('/departments').then(r => r.data),
  createRequest: (body: object) => http.post<RepairRequest>('/requests', body).then(r => r.data),
  myRequests: () => http.get<Page<RepairRequest>>('/requests', { params: { mine: true, page: 1, size: 20 } }).then(r => r.data),
  allRequests: () => http.get<Page<RepairRequest>>('/requests', { params: { page: 1, size: 50 } }).then(r => r.data),
  request: (id: string) => http.get<RepairRequest>(`/requests/${id}`).then(r => r.data),
  trace: (id: string) => http.get<Trace>(`/requests/${id}/trace`).then(r => r.data),
  assignments: () => http.get<Page<RepairRequest>>('/assignments', { params: { status: 'PENDING' } }).then(r => r.data),
  accept: (id: string) => http.post(`/assignments/${id}/accept`).then(r => r.data),
  reject: (id: string, reason: string) => http.post(`/assignments/${id}/reject`, { reason }).then(r => r.data),
  reviews: () => http.get<Page<ReviewItem>>('/reviews', { params: { status: 'OPEN' } }).then(r => r.data),
  resolve: (id: string, body: object) => http.post(`/reviews/${id}/resolve`, body).then(r => r.data),
  stats: () => http.get('/stats/summary').then(r => r.data)
};
