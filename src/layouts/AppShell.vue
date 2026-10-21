<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { currentUser, homeForRole, signOut } from '../services/auth';
import { roleLabel, useAirlines, useDepartments } from '../services/labels';

const router = useRouter();
const route = useRoute();
const user = currentUser();
const { airlineName } = useAirlines();
const { departmentName } = useDepartments();

const navByRole = { REPORTER: '정비 요청', MAINTENANCE: '배정 큐', ADMIN: '운영 콘솔' } as const;
const nav = computed(() => (user ? [{ to: homeForRole(user.role), label: navByRole[user.role] }] : []));
/** 이름 아래 한 줄: 소속. 시드 계정처럼 이름이 소속과 같으면 이메일을 보여줍니다. */
const affiliation = computed(() => {
  if (!user) return '';
  const text = user.role === 'REPORTER' ? airlineName(user.airline_code)
    : user.role === 'MAINTENANCE' ? `${departmentName(user.department_code)}팀` : roleLabel.ADMIN;
  return text === user.name ? user.email : `${roleLabel[user.role]} · ${text}`;
});
const initial = computed(() => user?.name?.trim().charAt(0) || '?');

function logout() { signOut(); router.replace('/login'); }
</script>

<template>
  <header class="topbar">
    <div class="topbar__inner">
      <RouterLink class="brand" :to="user ? homeForRole(user.role) : '/login'"><img class="brand__mark" src="/logo.png" alt="" />MRO Agent</RouterLink>
      <nav class="topbar__nav" aria-label="주 메뉴">
        <RouterLink v-for="item in nav" :key="item.to" :to="item.to" :class="{ 'is-active': route.path === item.to }">{{ item.label }}</RouterLink>
      </nav>
      <div class="topbar__right">
        <div class="user-chip">
          <div class="user-chip__text"><b>{{ user?.name }}</b><small>{{ affiliation }}</small></div>
          <span class="avatar" :title="user?.email">{{ initial }}</span>
        </div>
        <button class="text-button" type="button" @click="logout">로그아웃</button>
      </div>
    </div>
  </header>
  <main class="shell__main"><slot /></main>
</template>
