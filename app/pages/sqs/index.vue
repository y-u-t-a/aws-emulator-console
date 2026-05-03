<script setup lang="ts">
import type { SqsQueue } from '~~/shared/model/sqs'

const { data: queues, status, error, refresh } = await useFetch('/api/sqs/queues')
const selected = shallowRef<SqsQueue[]>([])
</script>

<template>
  <div>
    <div class="flex gap-3">
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="outline"
        :loading="status === 'pending'"
        @click="selected = []; refresh()"
      >
        再読み込み
      </UButton>
      <SqsQueueCreateForm @created="refresh()" />
      <SqsQueuePurgeButton
        :queues="selected"
        @purged="refresh()"
      />
      <SqsQueueDeleteButton
        :queues="selected"
        @deleted="selected = []; refresh()"
      />
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
      v-model:selected="selected"
      :queues="queues ?? []"
      :loading="status === 'pending'"
    />
  </div>
</template>
