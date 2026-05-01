<script setup lang="ts">
const { params } = useRoute('s3-bucketName-objectKeys')
</script>

<template>
  <div>
    <p>{{ params.bucketName }}</p>
    <p>{{ params.objectKeys }}</p>
  </div>
</template>
