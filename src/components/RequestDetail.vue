<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import StatusTag from './StatusTag.vue';
import EvidencePanel from './EvidencePanel.vue';
import ReferenceAmmPanel from './ReferenceAmmPanel.vue';
import { summarizeTrace } from '../services/trace';
import { formatTime, reporterStatusText, reviewReasonLabel, shortId, statusMeta, useAirlines, useDepartments } from '../services/labels';
import type { RepairRequest, RequestStatus, TraceResponse } from '../types';

const props = defineProps<{
  request: RepairRequest | null;
  trace?: TraceResponse | null;
  mode: 'reporter' | 'maintenance' | 'admin';
  canResolve?: boolean;
  busy?: boolean;
}>();
defineEmits<{ accept: []; reject: []; assign: []; close: [] }>();

const { airlineName } = useAirlines();
const { departmentName } = useDepartments();
const summary = computed(() => (props.trace ? summarizeTrace(props.trace) : null));

const order: Record<RequestStatus, number> = { QUEUED: 0, CLASSIFYING: 1, INVESTIGATING: 2, REVIEWING: 3, ASSIGNED: 4, ACCEPTED: 4, HUMAN_REVIEW: 4, CLOSED: 4 };
const steps = computed(() => {
  const status = props.request?.status ?? 'QUEUED';
  const reached = summary.value?.reached;
  const labels = ['접수', '이력 분류', '근거 조사', '검토·배정'];
  const stageReached = [true, !!reached?.has('CLASSIFYING'), !!reached?.has('INVESTIGATING'), !!(reached?.has('REVIEWING') || reached?.has('FINAL'))];
  return labels.map((label, i) => {
    const current = order[status] === i && i > 0 && order[status] < 4;
    const done = reached ? stageReached[i] && !current : i === 0 || order[status] > i || order[status] === 4;
    return { label, done, current };
  });
});
/** AI 추천 부서와 실제 담당 부서가 다르면(어드민 수동 배정) 따로 알려줍니다. */
const reassigned = computed(() => {
  const proposed = summary.value?.proposed_department;
  const assigned = props.request?.assigned_department;
  return proposed && assigned && proposed !== assigned ? { proposed, assigned } : null;
});
const history = computed(() => [...(props.trace?.history ?? [])].reverse());
const actorLabel = { USER: '사용자', AI: 'AI', SYSTEM: '시스템' } as const;
</script>

<template>
  <div v-if="request" class="detail">
    <div class="detail__scroll">
      <div class="detail__head">
        <div>
          <h2>{{ request.tail_number }} <span class="muted" style="font-weight:500">· {{ request.aircraft_model }}</span></h2>
          <span class="mono" :title="request.id">#{{ shortId(request.id) }}</span>
        </div>
        <StatusTag :status="request.status" :audience="mode === 'reporter' ? 'reporter' : 'operations'" />
      </div>

      <div class="steps" aria-label="처리 단계">
        <div v-for="step in steps" :key="step.label" class="step" :class="{ 'is-done': step.done, 'is-current': step.current }">
          <div class="step__bar" /><span>{{ step.label }}</span>
        </div>
      </div>

      <div v-if="mode === 'reporter'" class="callout" :class="request.status === 'HUMAN_REVIEW' ? 'callout--warn' : 'callout--info'"><span>{{ reporterStatusText[request.status] }}</span>
      </div>
      <div v-else-if="request.review_reason" class="callout callout--danger">
        <span><b>자동 배정 중지</b> · {{ reviewReasonLabel[request.review_reason] }}</span>
      </div>

      <dl class="kv">
        <div><dt>항공사</dt><dd>{{ airlineName(request.airline_code) }}</dd></div>
        <div><dt>담당 부서</dt><dd>{{ request.assigned_department ? departmentName(request.assigned_department) : '미정' }}</dd></div>
        <div><dt>접수</dt><dd>{{ formatTime(request.created_at) }}</dd></div>
        <div><dt>최근 업데이트</dt><dd>{{ formatTime(request.updated_at) }}</dd></div>
      </dl>

      <section>
        <div class="section-label">신고 증상</div>
        <p class="prose">{{ request.symptom_text }}</p>
      </section>

      <template v-if="mode !== 'reporter'">
        <section v-if="summary">
          <div class="section-label">AI 판단 요약</div>
          <p class="prose">{{ summary.finding || request.summary || '아직 AI 판단이 없습니다.' }}</p>
          <div class="chips">
            <span class="chip">ATA <b>{{ summary.ata_chapter || '-' }}</b></span>
            <span class="chip">AI 추천 <b>{{ summary.proposed_department ? departmentName(summary.proposed_department) : '-' }}</b></span>
            <span class="chip">재조사 <b>{{ summary.retry_count }}회</b></span>
          </div>
        </section>
        <div v-if="reassigned" class="callout callout--info">
          <span>AI는 <b>{{ departmentName(reassigned.proposed) }}</b>을(를) 추천했지만, 관리자가 <b>{{ departmentName(reassigned.assigned) }}</b>(으)로 수동 배정했습니다.</span>
        </div>
        <section v-if="summary">
          <div class="section-label">근거 자료</div>
          <EvidencePanel :items="summary.evidence" />
        </section>
        <section v-if="summary?.reference_amm.length">
          <div class="section-label">참고 AMM (정비팀 전달용)</div>
          <ReferenceAmmPanel :items="summary.reference_amm" />
        </section>
        <section v-if="history.length">
          <div class="section-label">처리 이력</div>
          <ol class="history">
            <li v-for="(h, i) in history" :key="i">
              <span class="history__time">{{ formatTime(h.created_at) }}</span>
              <span><b>{{ statusMeta[h.to_status].label }}</b><span class="subtle"> · {{ actorLabel[h.actor_type] }}</span><span v-if="h.note" class="muted"> — {{ h.note }}</span></span>
            </li>
          </ol>
        </section>
        <p v-else-if="!trace" class="note">상세 정보를 불러오는 중…</p>
      </template>
    </div>

    <div v-if="mode === 'maintenance' && request.status === 'ASSIGNED'" class="detail__actions">
      <Button label="배정 거절" severity="secondary" outlined :disabled="busy" @click="$emit('reject')" />
      <Button label="배정 수락" :loading="busy" @click="$emit('accept')" />
    </div>
    <div v-if="mode === 'admin' && request.status === 'HUMAN_REVIEW' && canResolve" class="detail__actions">
      <Button label="요청 종결" severity="secondary" outlined :disabled="busy" @click="$emit('close')" />
      <Button label="수동 배정" :disabled="busy" @click="$emit('assign')" />
    </div>
  </div>
  <div v-else class="detail-empty">
    <b>요청을 선택하세요</b>
    <p class="muted">목록에서 요청을 선택하면 상세 정보가 표시됩니다.</p>
  </div>
</template>
