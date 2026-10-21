<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { useAirlines } from '../services/labels';
import type { SupplementDetail } from '../types';

type Form = { tail_number: string; aircraft_model: string; airline_code: string; symptom_text: string };
const props = defineProps<{ submitting: boolean; supplement: SupplementDetail[] }>();
const model = defineModel<Form>({ required: true });
const emit = defineEmits<{ submit: [] }>();
const { airlineName } = useAirlines();

const fieldLabels: Record<string, string> = { tail_number: '기체번호', aircraft_model: '기종', airline_code: '항공사', symptom_text: '증상' };
const issueLabels: Record<string, string> = {
  REQUIRED: '필수 입력 항목입니다', NOT_FOUND: '등록되지 않은 기체입니다', INACTIVE: '운용 중이 아닌 기체입니다',
  MISMATCH: '등록 정보와 일치하지 않습니다', FORBIDDEN_AIRLINE: '소속 항공사의 기체가 아닙니다'
};
const invalid = computed(() => new Set(props.supplement.map(d => d.field)));
function update(field: 'tail_number' | 'aircraft_model', value: string | undefined) {
  model.value = { ...model.value, [field]: (value || '').toUpperCase() };
}
/** MISMATCH가 기대값을 알려주면 한 번에 고칠 수 있게 합니다. */
function applyExpected(detail: SupplementDetail) {
  if (detail.field && detail.expected && detail.field in model.value) model.value = { ...model.value, [detail.field]: detail.expected };
}
</script>

<template>
  <section class="card">
    <div class="card__header">
      <div><h2>새 정비 요청</h2><p>기체 정보와 확인한 증상을 입력하세요.</p></div>
    </div>
    <form class="card__body form" novalidate @submit.prevent="emit('submit')">
      <div v-if="supplement.length" class="callout callout--warn" role="alert">
        <div>
          <b>입력 정보를 확인해 주세요</b>
          <ul>
            <li v-for="detail in supplement" :key="`${detail.field}-${detail.issue}`">
              {{ fieldLabels[detail.field || ''] || detail.field || '요청 정보' }}: {{ issueLabels[detail.issue] || detail.issue }}
              <template v-if="detail.expected"> (등록 정보 <b>{{ detail.expected }}</b> · <a href="#" @click.prevent="applyExpected(detail)">적용</a>)</template>
            </li>
          </ul>
        </div>
      </div>
      <div class="form-row">
        <div class="field">
          <label for="tail-number">기체번호<em>*</em></label>
          <InputText id="tail-number" :modelValue="model.tail_number" placeholder="HL7701" :invalid="invalid.has('tail_number')" fluid
            @update:modelValue="update('tail_number', $event)" />
        </div>
        <div class="field">
          <label for="aircraft-model">기종<em>*</em></label>
          <InputText id="aircraft-model" :modelValue="model.aircraft_model" placeholder="A320-232" :invalid="invalid.has('aircraft_model')" fluid
            @update:modelValue="update('aircraft_model', $event)" />
        </div>
      </div>
      <div class="field">
        <label>항공사</label>
        <div class="readonly-value"><span>{{ airlineName(model.airline_code) }}</span><small>계정 소속</small></div>
      </div>
      <div class="field">
        <label for="symptom">증상<em>*</em></label>
        <Textarea id="symptom" v-model="model.symptom_text" rows="6" autoResize fluid :invalid="invalid.has('symptom_text')"
          placeholder="예: 착륙 후 좌측 메인기어 부근에서 연기 발생. 브레이크 온도 375°C 확인." />
        <div class="field-hint"><span>위치, 발생 시점, 경고 메시지와 수치를 함께 적으면 분류가 정확해집니다.</span><span>{{ model.symptom_text.length }}자</span></div>
      </div>
      <Button type="submit" label="요청 접수" :loading="submitting" fluid />
    </form>
  </section>
</template>
