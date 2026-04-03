<template>
  <p v-if="message" class="error-banner" role="alert">{{ message }}</p>
</template>

<script setup lang="ts">
defineProps<{
  message: string | null
}>()
</script>

<style scoped>
.error-banner {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: #fee2e2;
  color: #991b1b;
}
</style>
