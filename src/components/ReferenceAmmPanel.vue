<script setup lang="ts">
import { computed } from 'vue';
import type { ReferenceAmm } from '../types';

const props = defineProps<{ items: ReferenceAmm[] }>();
const levelLabel: Record<string, string> = { chapter_section: '장·절', subsection: '세부 절', task_format: '작업 번호' };

// 같은 번호가 여러 SDR에 인용되면 한 줄로 묶고, 인용 문장은 서로 다른 것만 남깁니다.
const grouped = computed(() => {
  const byRef = new Map<string, { amm_ref: string; level: string | null; sdrs: string[]; contexts: string[] }>();
  for (const item of props.items) {
    const group = byRef.get(item.amm_ref) ?? { amm_ref: item.amm_ref, level: item.reference_level, sdrs: [], contexts: [] };
    if (!group.sdrs.includes(item.sdr_ref_id)) group.sdrs.push(item.sdr_ref_id);
    if (item.context && !group.contexts.includes(item.context)) group.contexts.push(item.context);
    byRef.set(item.amm_ref, group);
  }
  return [...byRef.values()];
});
</script>

<template>
  <div class="evidence">
    <article v-for="group in grouped" :key="group.amm_ref" class="evidence__item">
      <div class="evidence__meta">
        <span class="evidence__source">AMM</span>
        <span class="mono"><b>{{ group.amm_ref }}</b></span>
        <span v-if="group.level" class="subtle">{{ levelLabel[group.level] ?? group.level }}</span>
      </div>
      <blockquote v-for="context in group.contexts" :key="context" class="evidence__quote">{{ context }}</blockquote>
      <p class="evidence__why">인용된 SDR 근거: <span class="mono">{{ group.sdrs.join(', ') }}</span></p>
    </article>
    <p class="note">배정 판단 근거가 아니라 정비팀 참고 정보입니다. 근거로 쓴 SDR 원문에 인용된 참조번호이며, 공식 매뉴얼 절차나 이 기체의 적용성을 확인한 것이 아닙니다.</p>
  </div>
</template>
