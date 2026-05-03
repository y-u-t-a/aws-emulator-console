<script setup lang="ts">
definePageMeta({
  layout: {
    name: 'service-page',
    props: {
      title: 'SQS',
    },
  },
})
</script>

<template>
  <NuxtLayout>
    <RouterView />
  </NuxtLayout>
</template>
