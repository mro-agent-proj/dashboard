import type { RepairRequest, ReviewItem, Trace } from '../types';

export const departments = [
  { code:'AVI', name:'항전' }, { code:'ELE', name:'전기' }, { code:'ENG', name:'엔진' },
  { code:'HYD', name:'유압·착륙장치' }, { code:'SYS', name:'기계 계통' }, { code:'STR', name:'구조' }, { code:'CAB', name:'객실' }
];
export const requests: RepairRequest[] = [
  { id:'REQ-2026-0012', tail_number:'HL7701', aircraft_model:'A320-214', airline_code:'KAL', symptom_text:'착륙 후 1번 타이어 부근에서 연기, 브레이크 온도 375℃', status:'ASSIGNED', assigned_department:'HYD', summary:'ATA 32 바퀴·브레이크 계통 점검 권고', created_at:'2026-10-21T02:42:00Z', updated_at:'2026-10-21T02:44:12Z', assignment_id:'ASG-0012' },
  { id:'REQ-2026-0011', tail_number:'HL7724', aircraft_model:'A321-231', airline_code:'KAL', symptom_text:'순항 중 객실 후방에서 간헐적인 전기 타는 냄새', status:'HUMAN_REVIEW', review_reason:'AGENT_NEEDS_HUMAN', summary:'ATA 25·33 담당 부서 충돌', created_at:'2026-10-21T01:18:00Z', updated_at:'2026-10-21T01:24:02Z' },
  { id:'REQ-2026-0010', tail_number:'HL7718', aircraft_model:'A320-232', airline_code:'KAL', symptom_text:'택시 중 좌측 메인기어 부근 유압유 누유 흔적', status:'ACCEPTED', assigned_department:'HYD', summary:'동일 기체 반복 누유 이력', created_at:'2026-10-21T00:02:00Z', updated_at:'2026-10-21T00:09:30Z' }
];
export const trace: Trace = {
  classification:{ ata_chapter:'32', linked_history_ids:['MH-000123'], sufficient:false, rationale:'동일 기체의 관련 이력은 있으나 현재 증상과 완전히 일치하지 않아 추가 조사가 필요합니다.' },
  investigations:[{ ata_chapter:'32', finding:'브레이크 과열 또는 타이어 어셈블리 이상 가능성', severity:'HIGH', proposed_department:'HYD', rationale:'유사 SDR과 AMM 32-40 인용이 일치합니다.', evidence:[
    { source:'SDR', ref_id:'SDR-2024-0012', excerpt:'Smoke observed near No.1 tire assembly after landing.', why:'동일 기종·운항 단계·부품의 유사 증상입니다.', score:.92 },
    { source:'AMM', ref_id:'AMM-32-40-WHEEL', excerpt:'Brake and tire inspection performed per AMM 32-40.', why:'조치 인용에서 바퀴·브레이크 점검 챕터가 확인됩니다.', score:.86 }
  ]}],
  reviews:[{ decision:'PASS', department:'HYD', comments:'근거와 ATA-부서 매핑이 일치합니다.' }], retry_count:0
};
export const reviews: ReviewItem[] = [{ id:'REV-0011', request_id:'REQ-2026-0011', reason:'AGENT_NEEDS_HUMAN', status:'OPEN', request:requests[1] }];
