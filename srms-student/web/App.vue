<script setup>
import { onMounted, ref } from 'vue';
import { portalApi } from './services/api.js';

const school = ref(null);
onMounted(async () => {
  try { school.value = await portalApi.getSchoolBrand(); } catch { /* unknown school is reported by the login/API */ }
});
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <component :is="Component" :key="route.path" :school="school" />
  </RouterView>
</template>