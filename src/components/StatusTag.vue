<script setup lang="ts">
import { computed } from 'vue';
import { statusMeta } from '../services/labels';
import type { RequestStatus } from '../types';

const props = defineProps<{ status: RequestStatus; audience?: 'reporter' | 'operations' }>();
const meta = computed(() => statusMeta[props.status]);
</script>

<template>
  <span class="badge" :class="`badge--${meta.tone}`"><span class="dot" />{{ audience === 'reporter' ? meta.reporter : meta.label }}</span>
</template>
