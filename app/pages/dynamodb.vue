<script setup lang="ts">
definePageMeta({
  layout: {
    name: 'service-page',
    props: {
      title: 'DynamoDB',
    },
  },
})
</script>

<template>
  <NuxtLayout>
    <RouterView />
  </NuxtLayout>
</template>
