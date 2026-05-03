<script setup lang="ts">
import type { SqsQueueDetail } from '~~/shared/model/sqs'

defineProps<{
  queue: SqsQueueDetail | null
  loading: boolean
}>()

defineEmits<{
  refresh: []
}>()
</script>

<template>
  <div class="border border-neutral-200 dark:border-neutral-800 rounded-md p-4">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold">
        キュー情報
      </h2>
      <div class="flex gap-2">
        <SqsQueueEditForm
          v-if="queue"
          :queue-name="queue.Name"
          :visibility-timeout="queue.VisibilityTimeout"
          @updated="$emit('refresh')"
        />
        <UButton
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="outline"
          size="sm"
          :loading="loading"
          @click="$emit('refresh')"
        >
          再読み込み
        </UButton>
      </div>
    </div>
    <dl
      v-if="queue"
      class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm"
    >
      <dt>
        タイプ
      </dt>
      <dd>
        <UBadge
          :color="queue.Type === 'fifo' ? 'primary' : 'neutral'"
          variant="subtle"
        >
          {{ queue.Type === 'fifo' ? 'FIFO' : 'Standard' }}
        </UBadge>
      </dd>
      <dt>
        URL
      </dt>
      <dd class="break-all">
        {{ queue.Url }}
      </dd>
      <dt>
        メッセージ数（可視）
      </dt>
      <dd>{{ queue.ApproximateNumberOfMessages }}</dd>
      <dt>
        メッセージ数（処理中）
      </dt>
      <dd>{{ queue.ApproximateNumberOfMessagesNotVisible }}</dd>
      <dt>
        メッセージ数（遅延中）
      </dt>
      <dd>{{ queue.ApproximateNumberOfMessagesDelayed }}</dd>
      <dt>
        可視性タイムアウト
      </dt>
      <dd>{{ queue.VisibilityTimeout }} 秒</dd>
      <template v-if="queue.Type === 'fifo'">
        <dt>
          コンテンツベース重複排除
        </dt>
        <dd>{{ queue.ContentBasedDeduplication ? '有効' : '無効' }}</dd>
      </template>
    </dl>
  </div>
</template>
