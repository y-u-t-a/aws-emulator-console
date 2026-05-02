<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div>
    <h1 class="text-3xl mb-3">
      {{ title }}
    </h1>
    <slot />
  </div>
</template>
