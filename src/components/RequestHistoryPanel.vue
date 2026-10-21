<script setup lang="ts">
import { computed, ref } from 'vue';
import Drawer from 'primevue/drawer';
import InputText from 'primevue/inputtext';
import RequestDetail from './RequestDetail.vue';
import RequestTable from './RequestTable.vue';
import SectionHeader from './ui/SectionHeader.vue';
import type { RepairRequest } from '../types';

const props=defineProps<{ items:RepairRequest[]; loading:boolean }>();
const selected=defineModel<RepairRequest|null>('selected',{default:null});
const query=ref('');
const drawerOpen=ref(false);
const filtered=computed(()=>{
  const keyword=query.value.trim().toLowerCase();
  if(!keyword)return props.items;
  return props.items.filter(item=>[item.id,item.tail_number,item.aircraft_model,item.symptom_text,item.status].some(value=>value.toLowerCase().includes(keyword)));
});
function openDetail(request:RepairRequest){selected.value=request;drawerOpen.value=true;}
</script>
<template>
  <section id="request-history" class="ds-surface history-panel" aria-labelledby="history-title">
    <SectionHeader index="02" title="내 요청 이력" description="최근 요청과 현재 처리 상태를 확인합니다.">
      <span class="ds-search"><i class="pi pi-search"/><InputText v-model="query" placeholder="요청번호, 기체, 증상 검색"/></span>
    </SectionHeader>
    <div class="history-panel__table" :class="{'is-loading':loading}"><RequestTable :items="filtered" :selected="selected" :showPriority="false" audience="reporter" @select="openDetail"/></div>
    <Drawer v-model:visible="drawerOpen" position="right" class="request-detail-drawer" header="요청 상세">
      <RequestDetail :request="selected" mode="reporter"/>
    </Drawer>
  </section>
</template>
