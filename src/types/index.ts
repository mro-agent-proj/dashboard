// 백엔드(Spring) 응답 DTO와 1:1로 맞춘 타입입니다. 필드 이름은 백엔드 Jackson SNAKE_CASE 출력 그대로입니다.
export type Role = 'REPORTER' | 'MAINTENANCE' | 'ADMIN';
export type RequestStatus = 'QUEUED' | 'CLASSIFYING' | 'INVESTIGATING' | 'REVIEWING' | 'ASSIGNED' | 'ACCEPTED' | 'HUMAN_REVIEW' | 'CLOSED';
export type ReviewReason = 'AGENT_NEEDS_HUMAN' | 'RETRY_LIMIT' | 'TEAM_REJECTED' | 'VALIDATION_FAILED' | 'SYSTEM_ERROR';
export type AssignmentStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type ReviewStatus = 'OPEN' | 'RESOLVED';
export type ReviewAction = 'ASSIGN' | 'CLOSE';

export interface User { id: string; name: string; email: string; role: Role; department_code?: string | null; airline_code?: string | null; }
export interface LoginResponse { access_token: string; token_type: string; expires_in: number; user: User; }
export interface Department { code: string; name: string; ata_chapters: string[]; }

/** 에러 응답: { error: { code, message, details? } } */
export interface ApiErrorBody { code: string; message: string; details?: SupplementDetail[]; }
/** 422 NEEDS_SUPPLEMENT의 details 항목 (IntakeIssue) */
export interface SupplementDetail { field?: string; issue: 'REQUIRED'|'NOT_FOUND'|'INACTIVE'|'MISMATCH'|'FORBIDDEN_AIRLINE'; expected?: string; }

export interface RepairRequest {
  id: string; tail_number: string; aircraft_model: string; airline_code: string; symptom_text: string;
  status: RequestStatus; review_reason: ReviewReason | null; assigned_department: string | null;
  summary: string | null; created_at: string; updated_at: string;
}
/** 배정·검토 목록에 함께 실리는 요청 요약 */
export interface RequestBrief {
  id: string; tail_number: string; aircraft_model: string; airline_code: string;
  symptom_text: string; summary: string | null; status: RequestStatus;
}
export interface Assignment {
  id: string; request_id: string; department_code: string; status: AssignmentStatus; assigned_by: 'AI' | 'ADMIN';
  reject_reason: string | null; created_at: string; responded_at: string | null; request: RequestBrief | null;
}
export interface ReviewItem {
  id: string; request_id: string; reason: ReviewReason; status: ReviewStatus; note: string | null;
  resolution: ReviewAction | null; department_code: string | null; resolution_note: string | null;
  resolved_by: string | null; created_at: string; resolved_at: string | null; request: RequestBrief | null;
}

/** stage별 output은 AI 서버가 보낸 JSON 그대로입니다. */
export type AssessmentStage = 'CLASSIFYING' | 'INVESTIGATING' | 'REVIEWING' | 'FINAL';
export interface Assessment { stage: AssessmentStage; attempt: number; output: Record<string, any> | null; created_at: string; }
export interface HistoryItem {
  from_status: RequestStatus | null; to_status: RequestStatus; review_reason: ReviewReason | null;
  actor_type: 'USER' | 'AI' | 'SYSTEM'; actor_id: string | null; note: string | null; created_at: string;
}
export interface TraceResponse { request: RepairRequest; assessments: Assessment[]; history: HistoryItem[]; }
export interface Evidence { source: 'HISTORY' | 'SDR' | 'AMM' | string; ref_id: string; excerpt: string; why: string; score?: number; }

export interface StatsSummary {
  from: string; to: string; total: number; by_status: Partial<Record<RequestStatus, number>>; by_department: Record<string, number>;
  auto_assigned: number; human_reviewed: number; auto_assign_rate: number | null; avg_minutes_to_first_assignment: number | null;
}
export interface Page<T> { items: T[]; total: number; }
