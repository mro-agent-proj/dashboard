<script setup lang="ts">
import { computed } from 'vue';
import Tag from 'primevue/tag';
import type { RequestStatus } from '../types';
const props = defineProps<{ status: RequestStatus; audience?:'reporter'|'operations' }>();
const map = { QUEUED:['분석 대기','info'], CLASSIFYING:['이력 분석 중','info'], INVESTIGATING:['기술자료 조사 중','info'], REVIEWING:['배정 검토 중','info'], ASSIGNED:['정비팀 응답 대기','warn'], ACCEPTED:['접수 완료','success'], HUMAN_REVIEW:['사람 검토','danger'], CLOSED:['종결','secondary'] } as const;
const label = computed(()=>props.status==='HUMAN_REVIEW'&&props.audience==='reporter'?'추가 확인 중':map[props.status][0]);
</script>
<template><Tag :value="label" :severity="map[props.status][1]"/></template>
