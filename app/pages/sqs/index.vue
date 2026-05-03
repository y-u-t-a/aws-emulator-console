<script setup lang="ts">
const { data: queues, status, error, refresh } = await useFetch('/api/sqs/queues')
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
      <SqsQueueCreateForm @created="refresh()" />
    </div>
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="キュー一覧の取得に失敗しました"
      :description="error.message"
    />
    <SqsQueueList
      v-else
      :queues="queues ?? []"
      :loading="status === 'pending'"
    />
  </div>
</template>
