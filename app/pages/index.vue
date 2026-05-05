<template>
  <div class="grid grid-cols-2 gap-6">
    <NuxtLink to="/s3">
      <UPageCard title="S3" />
    </NuxtLink>
    <NuxtLink to="/sqs">
      <UPageCard title="SQS" />
    </NuxtLink>
    <NuxtLink to="/dynamodb">
      <UPageCard title="DynamoDB" />
    </NuxtLink>
  </div>
</template>
