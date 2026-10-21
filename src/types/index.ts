export type Role = 'REPORTER' | 'MAINTENANCE' | 'ADMIN';
export type RequestStatus = 'QUEUED' | 'CLASSIFYING' | 'INVESTIGATING' | 'REVIEWING' | 'ASSIGNED' | 'ACCEPTED' | 'HUMAN_REVIEW' | 'CLOSED';

export interface User { id: string; name: string; email: string; role: Role; department_code?: string | null; airline_code?: string | null; }
export interface LoginResponse { access_token: string; token_type: 'bearer'; expires_in: number; user: User; }
export interface SupplementDetail { field?: string; issue: 'REQUIRED'|'NOT_FOUND'|'INACTIVE'|'MISMATCH'|'FORBIDDEN_AIRLINE'; expected?: string; message?: string; }
export interface Evidence { source: 'HISTORY' | 'SDR' | 'AMM'; ref_id: string; excerpt: string; why: string; score?: number; }
export interface Trace {
  classification?: { ata_chapter: string; linked_history_ids: string[]; sufficient: boolean; proposed_department?: string | null; rationale: string };
  investigations: Array<{ ata_chapter: string; finding: string; severity: 'LOW'|'MEDIUM'|'HIGH'|'AOG'; evidence: Evidence[]; proposed_department: string; rationale: string }>;
  reviews: Array<{ decision: 'PASS'|'SUPPLEMENT'|'HUMAN'; department?: string | null; comments: string; supplement_request?: string | null }>;
  retry_count: number;
}
export interface RepairRequest {
  id: string; tail_number: string; aircraft_model: string; airline_code: string; symptom_text: string;
  status: RequestStatus; review_reason?: string | null; assigned_department?: string | null;
  summary?: string; created_at: string; updated_at: string; assignment_id?: string;
}
export interface ReviewItem { id: string; request_id: string; reason: string; status: 'OPEN'|'RESOLVED'; request: RepairRequest; }
export interface Page<T> { items: T[]; total: number; }
