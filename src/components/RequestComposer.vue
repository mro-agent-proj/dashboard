<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Textarea from 'primevue/textarea';
import SectionHeader from './ui/SectionHeader.vue';
import type { SupplementDetail } from '../types';

const props = defineProps<{
  modelValue:{ tail_number:string; aircraft_model:string; airline_code:string; symptom_text:string };
  submitting:boolean;
  supplement:SupplementDetail[];
}>();
const emit = defineEmits<{ 'update:modelValue':[typeof props.modelValue]; submit:[] }>();
const model = computed({ get:()=>props.modelValue, set:value=>emit('update:modelValue',value) });
const fieldLabels:Record<string,string>={ tail_number:'기체번호', aircraft_model:'기종', airline_code:'항공사', symptom_text:'증상' };
const issueLabels:Record<string,string>={ REQUIRED:'필수 입력 항목입니다', NOT_FOUND:'등록되지 않은 값입니다', INACTIVE:'운용 중이 아닌 기체입니다', MISMATCH:'등록 정보와 일치하지 않습니다', FORBIDDEN_AIRLINE:'소속 항공사의 기체가 아닙니다' };
function update(field:'tail_number'|'aircraft_model', value:string|undefined){ model.value={...model.value,[field]:(value||'').toUpperCase()}; }
</script>
<template>
  <section id="new-request" class="ds-surface request-composer" aria-labelledby="new-request-title">
    <SectionHeader index="01" title="새 정비 요청" description="기체번호와 기종을 입력하고 확인한 증상을 적어 주세요.">
      <span class="required-note"><i/> 필수 항목</span>
    </SectionHeader>
    <form class="request-composer__form" @submit.prevent="emit('submit')">
      <Message v-if="supplement.length" class="supplement-message" severity="warn" :closable="false">
        <b>입력 정보를 확인해 주세요.</b>
        <ul><li v-for="detail in supplement" :key="`${detail.field}-${detail.issue}`">{{ fieldLabels[detail.field||''] || detail.field || '요청 정보' }}: {{ issueLabels[detail.issue] || detail.issue }}<span v-if="detail.expected"> (등록 정보: {{ detail.expected }})</span></li></ul>
      </Message>
      <div class="request-composer__meta">
        <div class="ds-field"><label for="tail-number">기체번호 <em>*</em></label><InputText id="tail-number" :modelValue="model.tail_number" @update:modelValue="update('tail_number',$event)" placeholder="예: HL7701" fluid/></div>
        <div class="ds-field"><label for="aircraft-model">기종 <em>*</em></label><InputText id="aircraft-model" :modelValue="model.aircraft_model" @update:modelValue="update('aircraft_model',$event)" placeholder="예: A320-232" fluid/></div>
        <div class="ds-field"><label>항공사</label><div class="ds-readonly-value"><span>{{ model.airline_code }}</span><small>계정 기준</small></div></div>
      </div>
      <div class="ds-field request-composer__symptom"><label for="symptom">증상 <em>*</em></label><Textarea id="symptom" v-model="model.symptom_text" rows="4" fluid placeholder="예: 착륙 후 좌측 메인기어 부근에서 연기 발생. 브레이크 온도 375°C 확인."/><div class="field-help"><span>위치, 발생 시점, 경고 메시지와 수치를 함께 적으면 분류 정확도가 높아집니다.</span><span>{{ model.symptom_text.length }}자</span></div></div>
      <footer class="request-composer__actions"><span><i class="pi pi-info-circle"/> 접수 후 처리 상태는 내 요청 이력에서 확인할 수 있습니다.</span><Button type="submit" label="정비 요청 접수" icon="pi pi-send" :loading="submitting"/></footer>
    </form>
  </section>
</template>
