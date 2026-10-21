<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'; import { useToast } from 'primevue/usetoast'; import Dialog from 'primevue/dialog'; import Button from 'primevue/button'; import Textarea from 'primevue/textarea';
import AppShell from '../layouts/AppShell.vue'; import RequestTable from '../components/RequestTable.vue'; import RequestDetail from '../components/RequestDetail.vue';
import { api, apiError } from '../services/api'; import { currentUser } from '../services/auth';
import type { Assignment, RepairRequest, TraceResponse } from '../types';
const toast=useToast(), user=currentUser(), departmentCode=user?.department_code||'';
const departmentName=ref(departmentCode), assignments=ref<Assignment[]>([]), items=ref<RepairRequest[]>([]), selected=ref<RepairRequest|null>(null), trace=ref<TraceResponse|null>(null);
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
onMounted(async()=>{
  load();timer=window.setInterval(load,15000);
  try{departmentName.value=(await api.departments()).find(d=>d.code===departmentCode)?.name||departmentCode;}catch{/* 코드로 표시 */}
});
onUnmounted(()=>{if(timer)clearInterval(timer);});
</script>
<template><AppShell><template #role>정비팀 · {{ departmentCode }}</template><div class="page-title"><div><span>MAINTENANCE WORKSPACE</span><h1>정비 배정 큐</h1><p>{{ departmentName }}팀에 배정된 요청과 Agent 근거를 검토합니다.</p></div><div class="live-pill"><i class="pi pi-circle-fill"/> LIVE QUEUE</div></div><div class="metric-strip"><div><small>응답 대기</small><b>{{ counts.pending }}</b></div><div><small>수락 완료</small><b>{{ counts.accepted }}</b></div><div><small>거절</small><b class="danger-text">{{ counts.rejected }}</b></div><div><small>담당 부서</small><b>{{ departmentCode }}</b></div></div><div class="console-grid"><div class="queue-panel"><div class="panel-head"><div><b>부서 대기함</b><small>PENDING · {{ departmentCode }}</small></div><Button label="새로고침" icon="pi pi-refresh" text :loading="loading" @click="load"/></div><RequestTable :items="items" :selected="selected" @select="select"/></div><RequestDetail :request="selected" :trace="trace" mode="maintenance" @accept="accept" @reject="rejectOpen=true"/></div><Dialog v-model:visible="rejectOpen" modal header="배정 거절" :style="{width:'480px'}"><p class="dialog-copy">거절 시 요청은 자동 재배정되지 않고 어드민 사람 검토 큐로 이동합니다.</p><Textarea v-model="reason" rows="4" fluid placeholder="담당 부서 불일치, 정보 부족 등 사유를 입력하세요."/><template #footer><Button label="취소" text @click="rejectOpen=false"/><Button label="거절 및 인계" severity="danger" :disabled="!reason.trim()" :loading="busy" @click="reject"/></template></Dialog></AppShell></template>
