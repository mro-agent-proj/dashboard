<script setup lang="ts">
defineProps<{ title:string; description?:string; index?:string }>();
</script>
<template>
  <div class="ds-section-header">
    <div class="ds-section-header__title"><span v-if="index">{{ index }}</span><div><h2>{{ title }}</h2><p v-if="description">{{ description }}</p></div></div>
    <div class="ds-section-header__actions"><slot/></div>
  </div>
</template>
