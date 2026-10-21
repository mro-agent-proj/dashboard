<script setup lang="ts">
import { computed, ref } from 'vue';
import Drawer from 'primevue/drawer';
import InputText from 'primevue/inputtext';
import RequestDetail from './RequestDetail.vue';
import RequestTable from './RequestTable.vue';
import { statusMeta } from '../services/labels';
import type { RepairRequest } from '../types';

const props = defineProps<{ items: RepairRequest[]; loading: boolean }>();
const selected = defineModel<RepairRequest | null>('selected', { default: null });
const query = ref('');
const drawerOpen = ref(false);
const filtered = computed(() => {
  const keyword = query.value.trim().toLowerCase();
  if (!keyword) return props.items;
  return props.items.filter(item =>
    [item.id, item.tail_number, item.aircraft_model, item.symptom_text, statusMeta[item.status].reporter].some(v => v.toLowerCase().includes(keyword)));
});
function openDetail(request: RepairRequest) { selected.value = request; drawerOpen.value = true; }
</script>

<template>
  <section class="card">
    <div class="card__header">
      <div><h2>내 요청<span class="count">{{ items.length }}</span></h2><p>최근 요청과 처리 상태입니다.</p></div>
      <span class="search"><InputText v-model="query" placeholder="기체, 증상, 상태 검색" /></span>
    </div>
    <RequestTable :items="filtered" :selected="drawerOpen ? selected : null" audience="reporter" :loading="loading"
      :emptyTitle="query ? '검색 결과가 없습니다' : '아직 접수한 요청이 없습니다'" :emptyText="query ? '다른 검색어를 입력해 보세요.' : '왼쪽에서 첫 정비 요청을 접수해 보세요.'"
      @select="openDetail" />
    <Drawer v-model:visible="drawerOpen" position="right" header="요청 상세" :style="{ width: 'min(480px, 100vw)' }">
      <RequestDetail :request="selected" mode="reporter" />
    </Drawer>
  </section>
</template>
