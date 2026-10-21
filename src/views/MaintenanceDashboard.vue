<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'; import { useToast } from 'primevue/usetoast'; import Dialog from 'primevue/dialog'; import Button from 'primevue/button'; import Textarea from 'primevue/textarea';
import AppShell from '../layouts/AppShell.vue'; import PageHeader from '../components/ui/PageHeader.vue'; import RequestTable from '../components/RequestTable.vue'; import RequestDetail from '../components/RequestDetail.vue';
import { api, apiError } from '../services/api'; import { currentUser } from '../services/auth'; import { useDepartments } from '../services/labels';
import type { Assignment, RepairRequest, TraceResponse } from '../types';
const toast=useToast(), user=currentUser(), departmentCode=user?.department_code||'';
const { departmentName } = useDepartments();
const assignments=ref<Assignment[]>([]), items=ref<RepairRequest[]>([]), selected=ref<RepairRequest|null>(null), trace=ref<TraceResponse|null>(null);
const counts=ref({pending:0,accepted:0,rejected:0}), loading=ref(false), busy=ref(false), rejectOpen=ref(false), reason=ref('');
let timer:number|undefined;

/** 배정 목록 항목을 요청 표 한 줄로 바꿉니다. 시각은 배정 시각입니다. */
function toRow(a:Assignment):RepairRequest{
  const r=a.request!;
  return { id:a.request_id, tail_number:r.tail_number, aircraft_model:r.aircraft_model, airline_code:r.airline_code, symptom_text:r.symptom_text, status:r.status, summary:r.summary, review_reason:null, assigned_department:a.department_code, created_at:a.created_at, updated_at:a.created_at };
}
async function load(){
  loading.value=true;
  try{
    const [pending,accepted,rejected]=await Promise.all([api.assignments('PENDING'),api.assignments('ACCEPTED',1),api.assignments('REJECTED',1)]);
    assignments.value=pending.items.filter(a=>a.request);
    items.value=assignments.value.map(toRow);
    counts.value={pending:pending.total,accepted:accepted.total,rejected:rejected.total};
    const keep=items.value.find(r=>r.id===selected.value?.id);
    if(!keep)await select(items.value[0]??null);
  }catch{toast.add({severity:'error',summary:'배정 목록을 불러오지 못했습니다',life:3000});}
  finally{loading.value=false;}
}
async function select(row:RepairRequest|null){
  selected.value=row;trace.value=null;
  if(!row)return;
  try{const t=await api.trace(row.id);if(selected.value?.id===row.id){trace.value=t;selected.value=t.request;}}
  catch{toast.add({severity:'error',summary:'요청 상세를 불러오지 못했습니다',life:3000});}
}
const assignmentOf=(requestId:string)=>assignments.value.find(a=>a.request_id===requestId);
async function accept(){
  const a=selected.value&&assignmentOf(selected.value.id);if(!a)return;
  busy.value=true;
  try{await api.accept(a.id);toast.add({severity:'success',summary:'배정 수락',detail:'정비 업무가 접수되었습니다.',life:2500});selected.value=null;await load();}
  catch(e){toast.add({severity:'error',summary:'수락하지 못했습니다',detail:apiError(e)?.message,life:3000});}
  finally{busy.value=false;}
}
async function reject(){
  const a=selected.value&&assignmentOf(selected.value.id);if(!a||!reason.value.trim())return;
  busy.value=true;
  try{await api.reject(a.id,reason.value.trim());rejectOpen.value=false;reason.value='';toast.add({severity:'warn',summary:'사람 검토 인계',detail:'거절 사유가 어드민 검토 큐에 전달되었습니다.',life:3000});selected.value=null;await load();}
  catch(e){toast.add({severity:'error',summary:'거절하지 못했습니다',detail:apiError(e)?.message,life:3000});}
  finally{busy.value=false;}
}
onMounted(()=>{load();timer=window.setInterval(load,15000);});
onUnmounted(()=>{if(timer)clearInterval(timer);});
</script>
<template>
  <AppShell>
    <PageHeader title="배정 큐" :description="`${departmentName(departmentCode)}팀에 배정된 요청과 AI 판단 근거를 확인합니다.`">
      <span class="pill"><span class="dot is-up" />15초마다 자동 갱신</span>
      <Button label="새로고침" severity="secondary" outlined size="small" :loading="loading" @click="load" />
    </PageHeader>
    <div class="stats">
      <div class="stat"><div class="stat__label">응답 대기</div><div class="stat__value">{{ counts.pending }}</div><div class="stat__hint">수락 또는 거절이 필요한 배정</div></div>
      <div class="stat"><div class="stat__label">수락 완료</div><div class="stat__value">{{ counts.accepted }}</div><div class="stat__hint">누적</div></div>
      <div class="stat"><div class="stat__label">거절</div><div class="stat__value" :class="{ 'is-danger': counts.rejected > 0 }">{{ counts.rejected }}</div><div class="stat__hint">관리자 검토로 넘어간 건</div></div>
      <div class="stat"><div class="stat__label">담당 부서</div><div class="stat__value">{{ departmentCode }}</div><div class="stat__hint">{{ departmentName(departmentCode) }}</div></div>
    </div>
    <div class="split">
      <section class="card">
        <div class="card__header"><div><h2>응답 대기<span class="count">{{ items.length }}</span></h2><p>배정된 순서대로 표시됩니다.</p></div></div>
        <RequestTable :items="items" :selected="selected" :loading="loading" timeLabel="배정" emptyTitle="대기 중인 배정이 없습니다" emptyText="새 배정이 들어오면 자동으로 표시됩니다." @select="select" />
      </section>
      <section class="card split__detail">
        <RequestDetail :request="selected" :trace="trace" mode="maintenance" :busy="busy" @accept="accept" @reject="rejectOpen = true" />
      </section>
    </div>
    <Dialog v-model:visible="rejectOpen" modal header="배정 거절" :style="{ width: 'min(480px, 92vw)' }">
      <p class="dialog-copy">거절하면 자동으로 다시 배정되지 않고, 관리자 검토 대기열로 넘어갑니다.</p>
      <div class="field">
        <label for="reject-reason">거절 사유<em>*</em></label>
        <Textarea id="reject-reason" v-model="reason" rows="4" fluid placeholder="담당 부서 불일치, 정보 부족 등" />
      </div>
      <template #footer>
        <Button label="취소" text severity="secondary" @click="rejectOpen = false" />
        <Button label="거절하고 넘기기" severity="danger" :disabled="!reason.trim()" :loading="busy" @click="reject" />
      </template>
    </Dialog>
  </AppShell>
</template>
