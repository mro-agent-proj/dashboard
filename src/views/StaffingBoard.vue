<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'; import { useToast } from 'primevue/usetoast'; import Button from 'primevue/button';
import AppShell from '../layouts/AppShell.vue'; import PageHeader from '../components/ui/PageHeader.vue'; import StaffDonut from '../components/StaffDonut.vue';
import { api } from '../services/api';
import type { StaffingSummary } from '../types';
const toast=useToast(), data=ref<StaffingSummary|null>(null), loading=ref(false), updatedAt=ref<Date|null>(null);
let timer:number|undefined;

/** 작업불가 = 출근했지만 작업 중·휴가 등으로 새 작업을 못 맡는 인원 */
const unavailable=(d:{on_duty:number;available:number})=>d.on_duty-d.available;
const pct=(part:number,whole:number)=>whole?Math.round(part/whole*100):0;
const departments=computed(()=>data.value?.departments??[]);

async function load(){
  loading.value=true;
  try{data.value=await api.staffing();updatedAt.value=new Date();}
  catch{toast.add({severity:'error',summary:'인원 현황을 불러오지 못했습니다',life:3000});}
  finally{loading.value=false;}
}
onMounted(()=>{load();timer=window.setInterval(load,15000);});
onUnmounted(()=>{if(timer)clearInterval(timer);});
</script>
<template>
  <AppShell>
    <PageHeader title="인원 현황" description="정비부서별 출근 인원과 그중 지금 작업을 맡을 수 있는 인원입니다. 배정에는 쓰이지 않는 참고용 화면입니다.">
      <span class="pill"><span class="dot is-up" />{{ updatedAt ? `${updatedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 기준` : '불러오는 중' }}</span>
      <Button label="운영 콘솔" severity="secondary" outlined size="small" @click="$router.push('/admin')" />
      <Button label="새로고침" severity="secondary" outlined size="small" :loading="loading" @click="load" />
    </PageHeader>
    <div v-if="data" class="staffing">
      <section class="card staffing__total">
        <div class="card__header"><div><h2>전체</h2><p>{{ departments.length }}개 부서 · 총원 {{ data.total }}명</p></div></div>
        <div class="staffing__total-body">
          <StaffDonut :available="data.available" :unavailable="unavailable(data)" :size="184">
            <b class="donut-value">{{ data.on_duty }}</b><span class="donut-label">출근 인원</span>
          </StaffDonut>
          <ul class="staff-legend">
            <li><i class="is-available" />작업가능<b>{{ data.available }}명</b><span>{{ pct(data.available, data.on_duty) }}%</span></li>
            <li><i class="is-unavailable" />작업불가<b>{{ unavailable(data) }}명</b><span>{{ pct(unavailable(data), data.on_duty) }}%</span></li>
            <li class="is-muted"><i />미출근<b>{{ data.total - data.on_duty }}명</b><span>제외</span></li>
          </ul>
        </div>
      </section>
      <section class="card">
        <div class="card__header"><div><h2>부서별<span class="count">{{ departments.length }}</span></h2><p>가운데 숫자가 출근 인원입니다. 조각에 마우스를 올리면 인원과 비율이 나옵니다.</p></div></div>
        <div class="dept-donuts">
          <div v-for="d in departments" :key="d.code" class="dept-donut">
            <div class="dept-donut__head"><b>{{ d.name }}</b><span class="mono subtle">{{ d.code }}</span></div>
            <StaffDonut :available="d.available" :unavailable="unavailable(d)" :size="112">
              <b class="donut-value is-small">{{ d.on_duty }}</b><span class="donut-label">출근</span>
            </StaffDonut>
            <div class="dept-donut__nums">
              <span><i class="is-available" />가능 <b>{{ d.available }}</b></span>
              <span><i class="is-unavailable" />불가 <b>{{ unavailable(d) }}</b></span>
            </div>
            <div class="dept-donut__foot">
              <span v-if="d.on_duty > 0 && d.available === 0" class="badge badge--red">작업가능 인원 없음</span>
              <span v-else class="subtle">총원 {{ d.total }}명 · 미출근 {{ d.total - d.on_duty }}명</span>
            </div>
          </div>
        </div>
      </section>
    </div>
    <div v-else class="card"><div class="empty"><b>{{ loading ? '불러오는 중입니다' : '인원 현황이 없습니다' }}</b><p>잠시 후 새로고침해 주세요.</p></div></div>
  </AppShell>
</template>

<style scoped>
.staffing { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 16px; align-items: start; }
.staffing__total-body { display: grid; justify-items: center; gap: 24px; padding: 24px 20px; }
.donut-value { font-size: 34px; font-weight: 700; letter-spacing: -.02em; line-height: 1.1; }
.donut-value.is-small { font-size: 24px; }
.donut-label { color: var(--text-2); font-size: 12px; }

.staff-legend { display: grid; gap: 10px; width: 100%; margin: 0; padding: 0; list-style: none; }
.staff-legend li { display: grid; grid-template-columns: 10px 1fr auto 52px; align-items: center; gap: 8px; color: var(--text-2); }
.staff-legend b { color: var(--text); font-weight: 600; }
.staff-legend span { color: var(--text-3); font-size: 12px; text-align: right; white-space: nowrap; }
.staff-legend li.is-muted, .staff-legend li.is-muted b { color: var(--text-3); }
i.is-available, i.is-unavailable, .staff-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; background: var(--border-strong); }
i.is-available { background: var(--green); }
i.is-unavailable { background: #f59e0b; }

.dept-donuts { display: grid; grid-template-columns: repeat(auto-fill, minmax(176px, 1fr)); gap: 12px; padding: 16px 20px 20px; }
.dept-donut { display: grid; justify-items: center; gap: 10px; padding: 14px 12px; border: 1px solid var(--border); border-radius: var(--radius-lg); }
.dept-donut__head { display: flex; align-items: baseline; gap: 6px; justify-self: stretch; }
.dept-donut__head b { font-weight: 600; }
.dept-donut__nums { display: flex; gap: 12px; color: var(--text-2); font-size: 13px; }
.dept-donut__nums span { display: inline-flex; align-items: center; gap: 5px; }
.dept-donut__nums b { color: var(--text); }
.dept-donut__foot { min-height: 24px; display: grid; place-items: center; font-size: 12px; }

@media (max-width: 1180px) { .staffing { grid-template-columns: 1fr; } .staffing__total-body { grid-template-columns: auto minmax(0, 260px); justify-content: center; align-items: center; } }
@media (max-width: 560px) {
  .staffing__total-body { grid-template-columns: 1fr; }
  .dept-donuts { grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 12px; gap: 8px; }
}
</style>
