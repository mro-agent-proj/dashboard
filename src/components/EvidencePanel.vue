<script setup lang="ts">
import Card from 'primevue/card'; import Tag from 'primevue/tag';
import type { Evidence } from '../types';
defineProps<{ items: Evidence[] }>();
</script>
<template><div class="evidence-list"><Card v-for="item in items" :key="item.ref_id" class="evidence-card"><template #title><div class="evidence-title"><Tag :value="item.source" severity="secondary"/><code>{{ item.ref_id }}</code><span v-if="item.score">{{ Math.round(item.score*100) }}%</span></div></template><template #content><blockquote>{{ item.excerpt }}</blockquote><p>{{ item.why }}</p></template></Card><div class="amm-notice"><i class="pi pi-info-circle"/> AMM 자료는 SDR에서 추출한 참조·인용 맥락이며 공식 매뉴얼 절차 본문이 아닙니다.</div></div></template>
