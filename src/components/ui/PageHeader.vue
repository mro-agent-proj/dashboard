<script setup lang="ts">
defineProps<{ title:string; description:string; eyebrow?:string }>();
</script>
<template>
  <div class="ds-page-header">
    <div><span v-if="eyebrow">{{ eyebrow }}</span><h1>{{ title }}</h1><p>{{ description }}</p></div>
    <div class="ds-page-header__actions"><slot/></div>
  </div>
</template>
