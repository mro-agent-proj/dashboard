<script setup lang="ts">
import Button from 'primevue/button';
import { useRouter } from 'vue-router';
import { currentUser, homeForRole, signOut } from '../services/auth';
const router=useRouter();
const nav=[{to:'/reporter',icon:'pi-file-edit',label:'정비 요청'},{to:'/maintenance',icon:'pi-inbox',label:'배정 요청'},{to:'/admin',icon:'pi-list-check',label:'요청 관리'}];
const user = currentUser();
const activeNav = nav.filter(item => item.to === (user ? homeForRole(user.role) : ''));
function logout(){ signOut(); router.replace('/login'); }
</script>
<template>
  <div class="app-shell">
    <header class="global-header">
      <div class="brand"><span class="brand-mark">A</span><div><strong>AeroMCC</strong><small>Maintenance Operations</small></div></div>
      <div class="global-header__context"><slot name="role"/></div>
      <div class="operator">
        <button class="header-help" type="button" aria-label="도움말"><i class="pi pi-question-circle"/></button>
        <button class="operator-profile" type="button"><div class="avatar">{{ user?.name?.slice(-2) || 'MRO' }}</div><span><b>{{ user?.name }}</b><small>{{ user?.email }}</small></span></button>
        <Button icon="pi pi-sign-out" text rounded aria-label="로그아웃" @click="logout"/>
      </div>
    </header>
    <aside>
      <div class="nav-group-label">정비 업무</div>
      <nav aria-label="주 메뉴"><Button v-for="item in activeNav" :key="item.to" :label="item.label" :icon="`pi ${item.icon}`" class="nav-button" @click="router.push(item.to)"/></nav>
      <div class="environment"><b>운영 시스템</b><small>문의 · 시스템 관리자</small></div>
    </aside>
    <main><section class="workspace"><slot/></section></main>
  </div>
</template>
