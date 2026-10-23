<script setup lang="ts">
import { computed } from 'vue';
/** 출근 인원을 작업가능·작업불가로 나눈 도넛. 가운데 숫자는 슬롯으로 받습니다. */
const props = withDefaults(defineProps<{ available: number; unavailable: number; size?: number }>(), { size: 120 });
const R = 40, C = 2 * Math.PI * R;
const total = computed(() => props.available + props.unavailable);
/** 조각 사이 2px 간격 (viewBox 100 기준으로 환산) */
const segments = computed(() => {
  const parts = [
    { key: 'available', label: '작업가능', value: props.available },
    { key: 'unavailable', label: '작업불가', value: props.unavailable }
  ].filter(p => p.value > 0);
  const gap = parts.length > 1 ? 2 * 100 / props.size : 0;
  let start = 0;
  return parts.map(p => {
    const length = p.value / total.value * C;
    const seg = { ...p, dash: `${Math.max(length - gap, 0)} ${C}`, offset: -start };
    start += length;
    return seg;
  });
});
</script>

<template>
  <div class="donut" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg viewBox="0 0 100 100" role="img" :aria-label="`출근 ${total}명 중 작업가능 ${available}명, 작업불가 ${unavailable}명`">
      <circle class="donut__track" cx="50" cy="50" :r="R" />
      <circle v-for="s in segments" :key="s.key" :class="`donut__seg is-${s.key}`" cx="50" cy="50" :r="R"
        :stroke-dasharray="s.dash" :stroke-dashoffset="s.offset" transform="rotate(-90 50 50)">
        <title>{{ s.label }} {{ s.value }}명 ({{ Math.round(s.value / total * 100) }}%)</title>
      </circle>
    </svg>
    <div class="donut__center"><slot /></div>
  </div>
</template>

<style scoped>
.donut { position: relative; flex: none; }
.donut svg { display: block; width: 100%; height: 100%; }
.donut circle { fill: none; stroke-width: 12; }
.donut__track { stroke: var(--surface-muted); }
.donut__seg { cursor: default; transition: stroke-dasharray .3s, opacity .12s; }
.donut__seg:hover { opacity: .8; }
.donut__seg.is-available { stroke: var(--green); }
.donut__seg.is-unavailable { stroke: #f59e0b; }
.donut__center { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; pointer-events: none; }
</style>
