import { ref } from 'vue';
import { api } from './api';
import type { Department, RequestStatus, ReviewReason, Role } from '../types';

export type Tone = 'blue' | 'amber' | 'green' | 'red' | 'gray';

export const statusMeta: Record<RequestStatus, { label: string; reporter: string; tone: Tone }> = {
  QUEUED: { label: '분석 대기', reporter: '접수됨', tone: 'blue' },
  CLASSIFYING: { label: '이력 분석 중', reporter: '분석 중', tone: 'blue' },
  INVESTIGATING: { label: '근거 조사 중', reporter: '분석 중', tone: 'blue' },
  REVIEWING: { label: '배정 검토 중', reporter: '분석 중', tone: 'blue' },
  ASSIGNED: { label: '정비팀 응답 대기', reporter: '정비팀 배정됨', tone: 'amber' },
  ACCEPTED: { label: '정비 접수', reporter: '정비 접수 완료', tone: 'green' },
  HUMAN_REVIEW: { label: '사람 검토', reporter: '추가 확인 중', tone: 'red' },
  CLOSED: { label: '종결', reporter: '종결', tone: 'gray' }
};

/** 신고자에게 보여주는 현재 단계 설명 */
export const reporterStatusText: Record<RequestStatus, string> = {
  QUEUED: '요청이 접수되었습니다. 곧 AI 분석이 시작됩니다.',
  CLASSIFYING: '수리 이력을 바탕으로 증상을 분류하고 있습니다.',
  INVESTIGATING: '기술 자료와 유사 사례를 조사하고 있습니다.',
  REVIEWING: '담당 정비팀 배정을 검토하고 있습니다.',
  ASSIGNED: '담당 정비팀에 배정되었습니다. 정비팀의 확인을 기다리고 있습니다.',
  ACCEPTED: '정비팀이 요청을 접수했습니다.',
  HUMAN_REVIEW: '담당자가 요청 내용을 추가로 확인하고 있습니다. 확인이 끝나면 상태가 갱신됩니다.',
  CLOSED: '요청 처리가 종결되었습니다.'
};

export const reviewReasonLabel: Record<ReviewReason, string> = {
  AGENT_NEEDS_HUMAN: 'AI가 사람 판단이 필요하다고 판단',
  RETRY_LIMIT: '재조사 한도 초과',
  TEAM_REJECTED: '정비팀이 배정을 거절',
  VALIDATION_FAILED: '배정 검증 실패',
  SYSTEM_ERROR: 'AI 처리 오류·시간 초과'
};

export const roleLabel: Record<Role, string> = { REPORTER: '신고자', MAINTENANCE: '정비팀', ADMIN: '관리자' };

export const shortId = (id: string) => id.slice(0, 8);

const kstDate = new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', timeZone: 'Asia/Seoul' });
const kstTime = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' });
/** 오늘이면 시각만, 아니면 날짜 + 시각 (KST) */
export function formatTime(iso: string) {
  const date = new Date(iso);
  const sameDay = kstDate.format(date) === kstDate.format(new Date());
  return sameDay ? kstTime.format(date) : `${kstDate.format(date)} ${kstTime.format(date)}`;
}

/** 항공사·부서 이름: 앱 전체에서 한 번만 불러옵니다. */
const airlines = ref<Record<string, string>>({});
const departments = ref<Department[]>([]);
let airlinesLoad: Promise<void> | null = null;
let departmentsLoad: Promise<void> | null = null;

export function useAirlines() {
  airlinesLoad ??= api.airlines()
    .then(list => { airlines.value = Object.fromEntries(list.map(a => [a.code, a.name])); })
    .catch(() => { airlinesLoad = null; });
  return { airlines, airlineName: (code?: string | null) => (code ? airlines.value[code] ?? code : '-') };
}

export function useDepartments() {
  departmentsLoad ??= api.departments()
    .then(list => { departments.value = list; })
    .catch(() => { departmentsLoad = null; });
  return { departments, departmentName: (code?: string | null) => (code ? departments.value.find(d => d.code === code)?.name ?? code : '-') };
}
