<script setup lang="ts">
</script>

<template>
  <div class="auth">
    <aside class="auth__aside">
      <div class="brand"><img class="brand__mark" src="/logo.png" alt="" />MRO Agent</div>
      <div class="auth__pitch">
        <h2>기체 이상 신고부터<br />정비팀 배정까지, 한 곳에서.</h2>
        <p>수리 이력과 SDR·AMM 근거를 AI가 분석해 담당 정비팀을 추천하고, 사람이 확인해야 할 건만 골라 드립니다.</p>
        <div class="auth__flow">
          <div> 정비 요청 접수 <small>신고자</small></div>
          <div> 이력·근거 분석과 부서 추천 <small>AI Agent</small></div>
          <div> 배정 확인·수락 <small>정비팀 · 관리자</small></div>
        </div>
      </div>
      <div class="auth__foot">© MRO Agent Maintenance Operations</div>
    </aside>
    <main class="auth__main">
      <div class="auth__card">
        <div class="brand auth__mobile-brand"><img class="brand__mark" src="/logo.png" alt="" />MRO Agent</div>
        <slot />
      </div>
    </main>
  </div>
</template>
