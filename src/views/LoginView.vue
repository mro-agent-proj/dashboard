<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Message from 'primevue/message';
import { homeForRole, signIn } from '../services/auth';

const router = useRouter();
const email = ref('reporter1@kal.test');
const password = ref('test1234');
const loading = ref(false);
const error = ref('');
const samples = [
  ['신고자', 'reporter1@kal.test'],
  ['정비팀', 'hyd@mro.test'],
  ['어드민', 'admin@mro.test']
];

async function submit() {
  loading.value = true; error.value = '';
  try {
    const user = await signIn(email.value, password.value);
    await router.replace(homeForRole(user.role));
  } catch { error.value = '이메일 또는 비밀번호를 확인해 주세요.'; }
  finally { loading.value = false; }
}
</script>

<template>
  <main class="login-page">
    <header class="login-header">
      <div class="login-brand"><span class="brand-mark">A</span><div><strong>AeroMCC</strong><small>Maintenance Operations</small></div></div>
      <span>항공 정비 업무 시스템</span>
    </header>
    <section class="login-form-panel">
      <form class="login-form" @submit.prevent="submit">
        <div class="login-form__intro"><span>업무 시스템</span><h1>로그인</h1><p>발급받은 사내 계정으로 로그인하세요.</p></div>
        <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
        <div class="login-field"><label for="email">이메일</label><InputText id="email" v-model="email" autocomplete="username" fluid /></div>
        <div class="login-field"><label for="password">비밀번호</label><Password inputId="password" v-model="password" :feedback="false" toggleMask fluid autocomplete="current-password" /></div>
        <Button type="submit" label="로그인" :loading="loading" fluid class="login-submit"/>
        <div class="sample-accounts"><div><b>테스트 계정</b><small>공통 비밀번호 test1234</small></div><button v-for="sample in samples" :key="sample[1]" type="button" @click="email=sample[1]"><span>{{ sample[0] }}</span><em>{{ sample[1] }}</em></button></div>
      </form>
    </section>
    <footer class="login-footer"><span>승인된 사용자만 이용할 수 있습니다.</span><span>© AeroMCC Maintenance Operations</span></footer>
  </main>
</template>
