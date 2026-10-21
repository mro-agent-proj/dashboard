<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'; import { useToast } from 'primevue/usetoast'; import Dialog from 'primevue/dialog'; import Button from 'primevue/button'; import Select from 'primevue/select'; import Textarea from 'primevue/textarea';
import AppShell from '../layouts/AppShell.vue'; import PageHeader from '../components/ui/PageHeader.vue'; import RequestTable from '../components/RequestTable.vue'; import RequestDetail from '../components/RequestDetail.vue';
import { api, apiError } from '../services/api'; import { useDepartments } from '../services/labels';
import type { RepairRequest, ReviewAction, ReviewItem, StatsSummary, TraceResponse } from '../types';
const toast=useToast(), items=ref<RepairRequest[]>([]), reviews=ref<ReviewItem[]>([]), stats=ref<StatsSummary|null>(null), ragStatus=ref('UNKNOWN');
const filter=ref<'ALL'|'HUMAN_REVIEW'>('ALL'), selected=ref<RepairRequest|null>(null), trace=ref<TraceResponse|null>(null);
const assignOpen=ref(false), closeOpen=ref(false), department=ref(''), note=ref(''), loading=ref(false), busy=ref(false);
const { departments } = useDepartments();
const departmentOptions=computed(()=>departments.value.map(d=>({label:`${d.name} (${d.code})`,value:d.code})));
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
onMounted(()=>{load();timer=window.setInterval(load,15000);});
onUnmounted(()=>{if(timer)clearInterval(timer);});
</script>
<template>
  <AppShell>
    <PageHeader title="운영 콘솔" description="전체 요청과 자동 배정이 중지된 건을 관리합니다.">
      <span class="pill" :title="'/actuator/health · ragData: ' + ragStatus">
        <span class="dot" :class="ragStatus === 'UP' ? 'is-up' : ragStatus === 'UNKNOWN' ? 'is-unknown' : 'is-down'" />
        RAG {{ ragStatus === 'UP' ? '정상' : ragStatus === 'UNKNOWN' ? '확인 중' : '점검 필요' }}
      </span>
      <Button label="새로고침" severity="secondary" outlined size="small" :loading="loading" @click="load" />
    </PageHeader>
    <div class="stats">
      <div class="stat"><div class="stat__label">전체 요청</div><div class="stat__value">{{ stats?.total ?? '-' }}</div><div class="stat__hint">누적</div></div>
      <div class="stat"><div class="stat__label">사람 검토 대기</div><div class="stat__value" :class="{ 'is-danger': (stats?.by_status.HUMAN_REVIEW ?? 0) > 0 }">{{ stats?.by_status.HUMAN_REVIEW ?? 0 }}</div><div class="stat__hint">자동 배정이 중지된 요청</div></div>
      <div class="stat"><div class="stat__label">자동 배정률</div><div class="stat__value">{{ pct(stats?.auto_assign_rate) }}</div><div class="stat__hint">AI가 바로 배정한 비율</div></div>
      <div class="stat"><div class="stat__label">첫 배정까지</div><div class="stat__value">{{ minutes(stats?.avg_minutes_to_first_assignment) }}</div><div class="stat__hint">평균 소요 시간</div></div>
    </div>
    <div class="split">
      <section class="card">
        <div class="card__header">
          <div><h2>요청 목록<span class="count">{{ items.length }}</span></h2><p>사람 검토 건을 먼저 보여줍니다.</p></div>
          <div class="segmented" role="tablist">
            <button type="button" role="tab" :class="{ 'is-active': filter === 'ALL' }" @click="setFilter('ALL')">전체</button>
            <button type="button" role="tab" :class="{ 'is-active': filter === 'HUMAN_REVIEW' }" @click="setFilter('HUMAN_REVIEW')">사람 검토 {{ reviews.length }}</button>
          </div>
        </div>
        <RequestTable :items="items" :selected="selected" :loading="loading"
          :emptyTitle="filter === 'ALL' ? '요청이 없습니다' : '검토할 요청이 없습니다'" emptyText="새 요청이 들어오면 자동으로 표시됩니다." @select="select" />
      </section>
      <section class="card split__detail">
        <RequestDetail :request="selected" :trace="trace" mode="admin" :canResolve="!!openReview" :busy="busy" @assign="openAssign" @close="closeOpen = true" />
      </section>
    </div>
    <Dialog v-model:visible="assignOpen" modal header="수동 배정" :style="{ width: 'min(480px, 92vw)' }">
      <div class="form">
        <div class="field">
          <label for="assign-dept">담당 부서<em>*</em></label>
          <Select inputId="assign-dept" v-model="department" :options="departmentOptions" optionLabel="label" optionValue="value" placeholder="부서 선택" fluid />
        </div>
        <div class="field">
          <label for="assign-note">검토 메모<em>*</em></label>
          <Textarea id="assign-note" v-model="note" rows="4" fluid placeholder="수동 배정 근거를 입력하세요." />
        </div>
      </div>
      <template #footer>
        <Button label="취소" text severity="secondary" @click="assignOpen = false" />
        <Button label="배정 확정" :disabled="!note.trim() || !department" :loading="busy" @click="resolve('ASSIGN')" />
      </template>
    </Dialog>
    <Dialog v-model:visible="closeOpen" modal header="요청 종결" :style="{ width: 'min(480px, 92vw)' }">
      <p class="dialog-copy">종결한 요청은 다시 배정되지 않습니다.</p>
      <div class="field">
        <label for="close-note">종결 사유<em>*</em></label>
        <Textarea id="close-note" v-model="note" rows="4" fluid />
      </div>
      <template #footer>
        <Button label="취소" text severity="secondary" @click="closeOpen = false" />
        <Button label="요청 종결" severity="danger" :disabled="!note.trim()" :loading="busy" @click="resolve('CLOSE')" />
      </template>
    </Dialog>
  </AppShell>
</template>
