import axios from 'axios';
import type {
  Airline, ApiErrorBody, Assignment, AssignmentStatus, Department, LoginResponse, Page, RepairRequest, RequestStatus,
  ReviewAction, ReviewItem, ReviewStatus, StatsSummary, TraceResponse, User
} from '../types';

const http = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1', timeout: 10000 });
http.interceptors.request.use(config => {
  const token = sessionStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
http.interceptors.response.use(r => r, error => {
  // 로그인 실패(INVALID_CREDENTIALS)도 401이므로 로그인·가입 요청은 화면에서 직접 처리합니다.
  if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) { sessionStorage.clear(); location.href = '/login'; }
  return Promise.reject(error);
});

/** 백엔드 공통 에러 응답 { error: { code, message, details } }을 꺼냅니다. */
export function apiError(error: unknown): (ApiErrorBody & { status?: number }) | null {
  if (!axios.isAxiosError(error)) return null;
  const body = error.response?.data?.error as ApiErrorBody | undefined;
  return body ? { ...body, status: error.response?.status } : null;
}

export const api = {
  login: (email: string, password: string) => http.post<LoginResponse>('/auth/login', { email, password }).then(r => r.data),
  signup: (body: { email: string; password: string; name: string; airline_code: string }) =>
    http.post<LoginResponse>('/auth/signup', body).then(r => r.data),
  airlines: () => http.get<Airline[]>('/airlines').then(r => r.data),
  me: () => http.get<User>('/me').then(r => r.data),
  departments: () => http.get<Department[]>('/departments').then(r => r.data),
  createRequest: (body: { tail_number: string; aircraft_model: string; airline_code: string; symptom_text: string }) =>
    http.post<RepairRequest>('/requests', body).then(r => r.data),
  myRequests: () => http.get<Page<RepairRequest>>('/requests', { params: { mine: true, page: 1, size: 20 } }).then(r => r.data),
  allRequests: (status?: RequestStatus) => http.get<Page<RepairRequest>>('/requests', { params: { status, page: 1, size: 100 } }).then(r => r.data),
  request: (id: string) => http.get<RepairRequest>(`/requests/${id}`).then(r => r.data),
  trace: (id: string) => http.get<TraceResponse>(`/requests/${id}/trace`).then(r => r.data),
  assignments: (status?: AssignmentStatus, size = 50) => http.get<Page<Assignment>>('/assignments', { params: { status, page: 1, size } }).then(r => r.data),
  accept: (assignmentId: string) => http.post<Assignment>(`/assignments/${assignmentId}/accept`).then(r => r.data),
  reject: (assignmentId: string, reason: string) => http.post<Assignment>(`/assignments/${assignmentId}/reject`, { reason }).then(r => r.data),
  reviews: (status?: ReviewStatus) => http.get<Page<ReviewItem>>('/reviews', { params: { status, page: 1, size: 100 } }).then(r => r.data),
  resolve: (reviewId: string, body: { action: ReviewAction; department_code?: string; note?: string }) =>
    http.post<ReviewItem>(`/reviews/${reviewId}/resolve`, body).then(r => r.data),
  stats: () => http.get<StatsSummary>('/stats/summary').then(r => r.data),
  /** /actuator는 /api 밖이라 baseURL을 쓰지 않습니다. */
  health: () => axios.get<{ status: string; components?: Record<string, { status: string }> }>('/actuator/health', { timeout: 5000 }).then(r => r.data)
};
