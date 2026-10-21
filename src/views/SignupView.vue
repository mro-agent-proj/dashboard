<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Select from 'primevue/select';
import AuthLayout from '../layouts/AuthLayout.vue';
import { api, apiError } from '../services/api';
import { signUp } from '../services/auth';
import type { Airline } from '../types';

const router = useRouter();
const toast = useToast();
const airlines = ref<Airline[]>([]);
const form = reactive({ name: '', email: '', airline_code: '', password: '', confirm: '' });
const errors = reactive<Record<string, string>>({});
const formError = ref('');
const loading = ref(false);
const touched = ref(false);

const airlineOptions = computed(() => airlines.value.map(a => ({ label: `${a.name} (${a.code})`, value: a.code })));

function validate() {
  for (const key of Object.keys(errors)) delete errors[key];
  if (!form.name.trim()) errors.name = '이름을 입력해 주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = '올바른 이메일 형식이 아닙니다.';
  if (!form.airline_code) errors.airline_code = '소속 항공사를 선택해 주세요.';
  if (form.password.length < 8) errors.password = '비밀번호는 8자 이상이어야 합니다.';
  else if (form.password.length > 72) errors.password = '비밀번호는 72자 이하여야 합니다.';
  if (form.confirm !== form.password) errors.confirm = '비밀번호가 일치하지 않습니다.';
  return Object.keys(errors).length === 0;
}

const fieldMessages: Record<string, string> = { email: '올바른 이메일 형식이 아닙니다.', password: '비밀번호는 8~72자여야 합니다.', name: '이름을 확인해 주세요.', airline_code: '등록되지 않은 항공사입니다.' };

async function submit() {
  touched.value = true;
  formError.value = '';
  if (!validate()) return;
  loading.value = true;
  try {
    const user = await signUp({ name: form.name, email: form.email, airline_code: form.airline_code, password: form.password });
    toast.add({ severity: 'success', summary: '가입이 완료되었습니다', detail: `${user.name}님, 환영합니다.`, life: 3000 });
    await router.replace('/reporter');
  } catch (e) {
    const body = apiError(e);
    if (body?.code === 'DUPLICATE_EMAIL') errors.email = '이미 가입된 이메일입니다.';
    else if (body?.code === 'VALIDATION_ERROR' && body.details?.length) body.details.forEach(d => { if (d.field) errors[d.field] = fieldMessages[d.field] ?? body.message; });
    else formError.value = body?.message ?? '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try { airlines.value = await api.airlines(); }
  catch { formError.value = '항공사 목록을 불러오지 못했습니다. 새로고침해 주세요.'; }
});
</script>

<template>
  <AuthLayout>
    <h1>회원가입</h1>
    <p>정비 요청을 접수할 신고자 계정을 만듭니다.</p>
    <form class="form" novalidate @submit.prevent="submit" @input="touched && validate()">
      <div v-if="formError" class="callout callout--danger" role="alert"><span>{{ formError }}</span></div>
      <div class="field">
        <label for="name">이름<em>*</em></label>
        <InputText id="name" v-model="form.name" autocomplete="name" placeholder="홍길동" :invalid="!!errors.name" fluid autofocus />
        <small v-if="errors.name" class="field-error">{{ errors.name }}</small>
      </div>
      <div class="field">
        <label for="email">이메일<em>*</em></label>
        <InputText id="email" v-model="form.email" type="email" autocomplete="email" placeholder="name@company.com" :invalid="!!errors.email" fluid />
        <small v-if="errors.email" class="field-error">{{ errors.email }}</small>
      </div>
      <div class="field">
        <label for="airline">소속 항공사<em>*</em></label>
        <Select inputId="airline" v-model="form.airline_code" :options="airlineOptions" optionLabel="label" optionValue="value" placeholder="항공사 선택" :invalid="!!errors.airline_code" fluid @change="touched && validate()" />
        <small v-if="errors.airline_code" class="field-error">{{ errors.airline_code }}</small>
      </div>
      <div class="field">
        <label for="password">비밀번호<em>*</em></label>
        <Password inputId="password" v-model="form.password" toggleMask fluid autocomplete="new-password" placeholder="8자 이상" :invalid="!!errors.password"
          promptLabel="비밀번호를 입력하세요" weakLabel="약함" mediumLabel="보통" strongLabel="강함" />
        <small v-if="errors.password" class="field-error">{{ errors.password }}</small>
      </div>
      <div class="field">
        <label for="confirm">비밀번호 확인<em>*</em></label>
        <Password inputId="confirm" v-model="form.confirm" :feedback="false" toggleMask fluid autocomplete="new-password" placeholder="비밀번호 다시 입력" :invalid="!!errors.confirm" />
        <small v-if="errors.confirm" class="field-error">{{ errors.confirm }}</small>
      </div>
      <Button type="submit" label="가입하고 시작하기" :loading="loading" fluid />
      <p class="note">정비팀·관리자 계정은 시스템 관리자가 발급합니다.</p>
    </form>
    <p class="auth__switch">이미 계정이 있으신가요? <RouterLink to="/login">로그인</RouterLink></p>
  </AuthLayout>
</template>
