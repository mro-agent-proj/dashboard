<script setup lang="ts">
import type { Evidence } from '../types';

defineProps<{ items: Evidence[] }>();
const sourceLabel: Record<string, string> = { HISTORY: '수리이력', SDR: 'SDR', AMM: 'AMM 참조' };
</script>

<template>
  <div class="evidence">
    <p v-if="!items.length" class="note">제시된 근거 자료가 없습니다.</p>
    <article v-for="item in items" :key="item.ref_id" class="evidence__item">
      <div class="evidence__meta">
        <span class="evidence__source">{{ sourceLabel[item.source] ?? item.source }}</span>
        <span class="mono">{{ item.ref_id }}</span>
        <span v-if="item.score != null" class="evidence__score">{{ Math.round(item.score * 100) }}%</span>
      </div>
      <blockquote class="evidence__quote">{{ item.excerpt }}</blockquote>
      <p class="evidence__why">{{ item.why }}</p>
    </article>
    <p v-if="items.some(i => i.source === 'AMM')" class="note">AMM 자료는 SDR에서 추출한 참조·인용 맥락이며 공식 매뉴얼 절차 본문이 아닙니다.</p>
  </div>
</template>
