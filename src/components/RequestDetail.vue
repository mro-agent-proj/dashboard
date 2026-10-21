<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button'; import Divider from 'primevue/divider'; import Message from 'primevue/message'; import Timeline from 'primevue/timeline';
import StatusTag from './StatusTag.vue'; import EvidencePanel from './EvidencePanel.vue';
import { summarizeTrace } from '../services/trace';
import type { RepairRequest, TraceResponse } from '../types';
const props=defineProps<{ request:RepairRequest|null; trace?:TraceResponse|null; mode:'reporter'|'maintenance'|'admin'; canResolve?:boolean }>();
defineEmits<{ accept:[]; reject:[]; assign:[]; close:[] }>();
const summary=computed(()=>props.trace?summarizeTrace(props.trace):null);
const stages=computed(()=>{
  const reached=summary.value?.reached??new Set();
  return [
    {label:'접수 확인',icon:'pi-check',done:true},
    {label:'초기 분류',icon:'pi-sitemap',done:reached.has('CLASSIFYING')},
    {label:'근거 조사',icon:'pi-search',done:reached.has('INVESTIGATING')},
    {label:'검토·배정',icon:'pi-verified',done:reached.has('REVIEWING')||reached.has('FINAL')}
  ];
});
</script>
<template><div v-if="request" class="detail-panel"><div class="detail-head"><div><span class="mono">{{ request.id }}</span><h2>{{ request.tail_number }} · {{ request.aircraft_model }}</h2></div><StatusTag :status="request.status" :audience="mode==='reporter'?'reporter':'operations'"/></div><div class="aircraft-strip"><div><small>항공사</small><b>{{ request.airline_code }}</b></div><div><small>담당 부서</small><b>{{ request.assigned_department || '미정' }}</b></div><div><small>업데이트</small><b>{{ new Date(request.updated_at).toLocaleTimeString('ko-KR') }}</b></div></div><Divider/><section><label>신고 증상</label><p class="symptom">{{ request.symptom_text }}</p></section><Message v-if="request.review_reason" severity="error" :closable="false">{{ mode==='reporter'?'요청 내용을 추가로 확인하고 있습니다. 확인이 끝나면 처리 상태가 갱신됩니다.':`${request.review_reason} · 자동 배정이 중지되었습니다.` }}</Message><template v-if="mode!=='reporter' && summary"><Divider/><section><label>Agent 처리 단계</label><Timeline :value="stages" layout="horizontal" align="top" class="agent-timeline"><template #marker="slotProps"><span class="timeline-marker" :class="{'is-pending':!slotProps.item.done}"><i :class="`pi ${slotProps.item.icon}`"/></span></template><template #content="slotProps"><small>{{ slotProps.item.label }}</small></template></Timeline></section><Divider/><section><label>판단 요약</label><p class="finding">{{ summary.finding || request.summary || 'Agent 판단이 아직 없습니다.' }}</p><div class="decision-row"><span>ATA <b>{{ summary.ata_chapter || '-' }}</b></span><span>추천 <b>{{ summary.proposed_department || '-' }}</b></span><span>재조사 <b>{{ summary.retry_count }}회</b></span></div></section><Divider/><section><label>근거 자료</label><EvidencePanel :items="summary.evidence"/></section></template><div v-if="mode==='maintenance' && request.status==='ASSIGNED'" class="sticky-actions"><Button label="배정 거절" severity="danger" outlined icon="pi pi-times" @click="$emit('reject')"/><Button label="배정 수락" severity="success" icon="pi pi-check" @click="$emit('accept')"/></div><div v-if="mode==='admin' && request.status==='HUMAN_REVIEW' && canResolve" class="sticky-actions"><Button label="요청 종결" severity="danger" outlined @click="$emit('close')"/><Button label="수동 배정" icon="pi pi-send" @click="$emit('assign')"/></div></div><div v-else class="empty-detail"><i class="pi pi-inbox"/><h3>요청을 선택하세요</h3><p>왼쪽 큐에서 요청을 선택하면 상세 정보가 표시됩니다.</p></div></template>
