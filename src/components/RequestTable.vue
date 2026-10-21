<script setup lang="ts">
import StatusTag from './StatusTag.vue';
import { formatTime, shortId } from '../services/labels';
import type { RepairRequest } from '../types';

withDefaults(defineProps<{
  items: RepairRequest[];
  selected?: RepairRequest | null;
  audience?: 'reporter' | 'operations';
  loading?: boolean;
  timeLabel?: string;
  emptyTitle?: string;
  emptyText?: string;
}>(), { audience: 'operations', timeLabel: '접수', emptyTitle: '요청이 없습니다', emptyText: '새 요청이 들어오면 여기에 표시됩니다.' });
const emit = defineEmits<{ select: [RepairRequest] }>();
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr><th>기체</th><th>증상</th><th>상태</th><th class="col-optional">{{ timeLabel }}</th></tr>
      </thead>
      <tbody>
        <template v-if="loading && !items.length">
          <tr v-for="n in 4" :key="n" class="skeleton-row"><td colspan="4"><div class="skeleton" :style="{ width: `${90 - n * 12}%` }" /></td></tr>
        </template>
        <tr v-for="row in items" v-else :key="row.id" :class="{ 'is-selected': row.id === selected?.id }" tabindex="0"
          @click="emit('select', row)" @keydown.enter="emit('select', row)">
          <td>
            <div class="cell-main">{{ row.tail_number }}</div>
            <div class="cell-sub">{{ row.aircraft_model }} · <span class="mono" :title="row.id">{{ shortId(row.id) }}</span></div>
          </td>
          <td><span class="cell-symptom">{{ row.symptom_text }}</span></td>
          <td><StatusTag :status="row.status" :audience="audience" /></td>
          <td class="col-optional"><span class="cell-time">{{ formatTime(row.created_at) }}</span></td>
        </tr>
      </tbody>
    </table>
    <div v-if="!loading && !items.length" class="empty"><b>{{ emptyTitle }}</b><p>{{ emptyText }}</p></div>
  </div>
</template>
