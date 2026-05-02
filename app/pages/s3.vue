<script setup lang="ts">
definePageMeta({
  layout: {
    name: 'service-page',
    props: {
      title: 'S3',
    },
  },
})
</script>

<template>
  <NuxtLayout>
    <RouterView />
  </NuxtLayout>
</template>
