<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { SqsMessage, SqsQueueDetail } from '~~/shared/model/sqs'

const route = useRoute('sqs-queueName')
const queueName = computed(() => route.params.queueName as string)

const { data: queue, status, error, refresh } = await useFetch<SqsQueueDetail>(
  () => `/api/sqs/${queueName.value}`,
)

const messages = ref<SqsMessage[]>([])

const bread = computed<BreadcrumbItem[]>(() => [
  { label: 'キュー', to: { name: 'sqs' } },
  { label: queueName.value, to: { name: 'sqs-queueName', params: { queueName: queueName.value } } },
])
</script>

<template>
  <div>
    <UBreadcrumb
      :items="bread"
      class="mb-3"
    />
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="キュー情報の取得に失敗しました"
      :description="error.message"
    />
    <template v-else>
      <SqsQueueDetailPanel
        :queue="queue ?? null"
        :loading="status === 'pending'"
        @refresh="refresh()"
      />
      <div class="flex flex-wrap gap-3 mt-6">
        <SqsMessageSendForm
          :queue-name="queueName"
          :fifo="queue?.Type === 'fifo'"
          :content-based-deduplication="queue?.ContentBasedDeduplication ?? false"
          @sent="refresh()"
        />
        <SqsMessageReceiveButton
          :queue-name="queueName"
          @received="messages = $event; refresh()"
        />
      </div>
      <SqsMessageList
        v-model:messages="messages"
        :queue-name="queueName"
        class="mt-4"
        @deleted="refresh()"
      />
    </template>
  </div>
</template>
