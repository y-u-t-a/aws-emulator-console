<script setup lang="ts">
const { params } = useRoute('s3-bucketName')
</script>

<template>
  <p>{{ params.bucketName }}</p>
</template>
