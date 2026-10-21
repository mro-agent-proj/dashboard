<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import AuthLayout from '../layouts/AuthLayout.vue';
import { apiError } from '../services/api';
import { homeForRole, signIn } from '../services/auth';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function submit() {
  error.value = '';
  if (!email.value.trim() || !password.value) { error.value = '이메일과 비밀번호를 입력해 주세요.'; return; }
  loading.value = true;
  try {
    const user = await signIn(email.value, password.value);
    await router.replace(homeForRole(user.role));
  } catch (e) {
    const body = apiError(e);
    error.value = body?.code === 'INVALID_CREDENTIALS' ? '이메일 또는 비밀번호가 올바르지 않습니다.' : '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthLayout>
    <h1>로그인</h1>
    <p>항공기 정비요청 Agent 계정으로 로그인하세요.</p>
    <form class="form" novalidate @submit.prevent="submit">
      <div v-if="error" class="callout callout--danger" role="alert"><span>{{ error }}</span></div>
      <div class="field">
        <label for="email">이메일</label>
        <InputText id="email" v-model="email" type="email" autocomplete="username" placeholder="name@company.com" fluid autofocus />
      </div>
      <div class="field">
        <label for="password">비밀번호</label>
        <Password inputId="password" v-model="password" :feedback="false" toggleMask fluid autocomplete="current-password" placeholder="비밀번호" />
      </div>
      <Button type="submit" label="로그인" :loading="loading" fluid />
    </form>
    <p class="auth__switch">계정이 없으신가요? <RouterLink to="/signup">신고자 회원가입</RouterLink></p>
  </AuthLayout>
</template>
