<script setup lang="ts">
const { data: buckets, status, error, refresh } = await useFetch('/api/s3/buckets')
</script>

<template>
  <div>
    <div class="flex gap-3">
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="outline"
        :loading="status === 'pending'"
        @click="refresh()"
      >
        再読み込み
      </UButton>
      <S3BucketCreateForm @created="refresh()" />
    </div>
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="バケット一覧の取得に失敗しました"
      :description="error.message"
    />
    <S3BucketList
      v-else
      :buckets="buckets ?? []"
      :loading="status === 'pending'"
    />
  </div>
</template>
