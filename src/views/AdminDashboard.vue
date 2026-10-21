<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'; import { useToast } from 'primevue/usetoast'; import Dialog from 'primevue/dialog'; import Button from 'primevue/button'; import Select from 'primevue/select'; import Textarea from 'primevue/textarea';
import AppShell from '../layouts/AppShell.vue'; import RequestTable from '../components/RequestTable.vue'; import RequestDetail from '../components/RequestDetail.vue';
import { api, apiError } from '../services/api';
import type { Department, RepairRequest, ReviewAction, ReviewItem, StatsSummary, TraceResponse } from '../types';
const toast=useToast(), items=ref<RepairRequest[]>([]), reviews=ref<ReviewItem[]>([]), departments=ref<Department[]>([]), stats=ref<StatsSummary|null>(null), ragStatus=ref('UNKNOWN');
const filter=ref<'ALL'|'HUMAN_REVIEW'>('ALL'), selected=ref<RepairRequest|null>(null), trace=ref<TraceResponse|null>(null);
const assignOpen=ref(false), closeOpen=ref(false), department=ref(''), note=ref(''), loading=ref(false), busy=ref(false);
let timer:number|undefined;

const openReview=computed(()=>selected.value?reviews.value.find(r=>r.request_id===selected.value!.id)??null:null);
const pct=(v:number|null|undefined)=>v==null?'-':`${Math.round(v*100)}%`;
const minutes=(v:number|null|undefined)=>v==null?'-':v<1?`${Math.round(v*60)}s`:`${v.toFixed(1)}m`;

async function load(){
  loading.value=true;
  try{
    const [page,open,summary]=await Promise.all([api.allRequests(filter.value==='ALL'?undefined:'HUMAN_REVIEW'),api.reviews('OPEN'),api.stats()]);
    // 사람 검토 건을 먼저 보여줍니다 (같은 그룹 안에서는 최신순 유지).
    items.value=[...page.items].sort((a,b)=>Number(b.status==='HUMAN_REVIEW')-Number(a.status==='HUMAN_REVIEW'));
    reviews.value=open.items;stats.value=summary;
    const keep=items.value.find(r=>r.id===selected.value?.id);
    if(keep)selected.value=keep;else await select(items.value[0]??null);
  }catch{toast.add({severity:'error',summary:'요청 목록을 불러오지 못했습니다',life:3000});}
  finally{loading.value=false;}
  api.health().then(h=>{ragStatus.value=h.components?.ragData?.status??h.status;}).catch(()=>{ragStatus.value='DOWN';});
}
async function select(row:RepairRequest|null){
  selected.value=row;trace.value=null;
  if(!row)return;
  try{const t=await api.trace(row.id);if(selected.value?.id===row.id){trace.value=t;selected.value=t.request;}}
  catch{toast.add({severity:'error',summary:'요청 상세를 불러오지 못했습니다',life:3000});}
}
function setFilter(value:'ALL'|'HUMAN_REVIEW'){filter.value=value;load();}
function openAssign(){department.value=selected.value?.assigned_department||departments.value[0]?.code||'';assignOpen.value=true;}
async function resolve(action:ReviewAction){
  const review=openReview.value;if(!review||!note.value.trim())return;
  if(action==='ASSIGN'&&!department.value)return;
  busy.value=true;
  try{
    await api.resolve(review.id,{action,note:note.value.trim(),...(action==='ASSIGN'?{department_code:department.value}:{})});
    toast.add({severity:'success',summary:action==='ASSIGN'?'수동 배정 완료':'요청 종결',detail:`${review.request?.tail_number??''} 처리가 완료되었습니다.`,life:2500});
    assignOpen.value=false;closeOpen.value=false;note.value='';
    await load();if(selected.value)await select(selected.value);
  }catch(e){toast.add({severity:'error',summary:'처리하지 못했습니다',detail:apiError(e)?.message,life:3000});}
  finally{busy.value=false;}
}
onMounted(async()=>{
  load();timer=window.setInterval(load,15000);
  try{departments.value=await api.departments();}catch{toast.add({severity:'error',summary:'부서 목록을 불러오지 못했습니다',life:3000});}
});
onUnmounted(()=>{if(timer)clearInterval(timer);});
</script>
<template><AppShell><template #role>어드민 · MCC</template><div class="page-title"><div><span>CONTROL DESK</span><h1>정비상황실 운영 콘솔</h1><p>전체 요청과 자동 배정 중지 건을 한 화면에서 관리합니다.</p></div><div class="rag-health"><i class="pi pi-database"/><div><b>RAG {{ ragStatus==='UP'?'READY':ragStatus }}</b><small>/actuator/health · ragData</small></div></div></div><div class="metric-strip"><div><small>전체 요청</small><b>{{ stats?.total ?? '-' }}</b></div><div><small>사람 검토</small><b class="danger-text">{{ stats?.by_status.HUMAN_REVIEW ?? 0 }}</b></div><div><small>자동 배정률</small><b>{{ pct(stats?.auto_assign_rate) }}</b></div><div><small>첫 배정까지 평균</small><b>{{ minutes(stats?.avg_minutes_to_first_assignment) }}</b></div></div><div class="console-grid"><div class="queue-panel"><div class="panel-head"><div><b>전체 요청 큐</b><small>HUMAN_REVIEW 우선 표시 · 검토 대기 {{ reviews.length }}건</small></div><div class="filter-tabs"><Button label="전체" size="small" :outlined="filter!=='ALL'" @click="setFilter('ALL')"/><Button label="사람 검토" severity="danger" size="small" :outlined="filter!=='HUMAN_REVIEW'" @click="setFilter('HUMAN_REVIEW')"/><Button icon="pi pi-refresh" text size="small" :loading="loading" aria-label="새로고침" @click="load"/></div></div><RequestTable :items="items" :selected="selected" @select="select"/></div><RequestDetail :request="selected" :trace="trace" mode="admin" :canResolve="!!openReview" @assign="openAssign" @close="closeOpen=true"/></div><Dialog v-model:visible="assignOpen" modal header="수동 부서 배정" :style="{width:'480px'}"><div class="request-form"><label>담당 부서</label><Select v-model="department" :options="departments" :optionLabel="d=>`${d.code} · ${d.name}`" optionValue="code" fluid/><label>검토 메모</label><Textarea v-model="note" rows="4" fluid placeholder="수동 배정 근거를 입력하세요."/></div><template #footer><Button label="취소" text @click="assignOpen=false"/><Button label="배정 확정" :disabled="!note.trim()||!department" :loading="busy" @click="resolve('ASSIGN')"/></template></Dialog><Dialog v-model:visible="closeOpen" modal header="요청 종결" :style="{width:'480px'}"><p class="dialog-copy">종결된 요청은 자동 배정되지 않습니다. 종결 사유를 입력하세요.</p><Textarea v-model="note" rows="4" fluid/><template #footer><Button label="취소" text @click="closeOpen=false"/><Button label="요청 종결" severity="danger" :disabled="!note.trim()" :loading="busy" @click="resolve('CLOSE')"/></template></Dialog></AppShell></template>
