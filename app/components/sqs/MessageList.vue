<script setup lang="ts">
import type { DeleteSqsMessageApiRequest, SqsMessage } from '#shared/model/sqs'
import { formatDateTime } from '#shared/util/datetime'

const props = defineProps<{
  queueName: string
}>()

const emits = defineEmits<{
  deleted: [messageId: string]
}>()

const messages = defineModel<SqsMessage[]>('messages', { required: true })
const toast = useToast()
const deletingId = ref<string | null>(null)

async function deleteOne(message: SqsMessage) {
  deletingId.value = message.MessageId
  try {
    await $fetch(`/api/sqs/${props.queueName}/messages`, {
      method: 'DELETE',
      body: { receiptHandle: message.ReceiptHandle } satisfies DeleteSqsMessageApiRequest,
    })
    messages.value = messages.value.filter(m => m.MessageId !== message.MessageId)
    toast.add({ title: 'メッセージを削除しました', description: message.MessageId, color: 'success' })
    emits('deleted', message.MessageId)
  } catch (e) {
    toast.add({
      title: 'メッセージの削除に失敗しました',
      description: e instanceof Error ? e.message : undefined,
      color: 'error',
    })
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold mb-2">
      受信したメッセージ
    </h2>
    <p
      v-if="messages.length === 0"
      class="text-sm text-neutral-500"
    >
      「メッセージ受信」を押すと、ここに最大10件まで表示されます。受信後は可視性タイムアウト中、他のクライアントから見えなくなります。
    </p>
    <ul
      v-else
      class="flex flex-col gap-3"
    >
      <li
        v-for="message in messages"
        :key="message.MessageId"
        class="border border-neutral-200 dark:border-neutral-800 rounded-md p-3"
      >
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div class="flex flex-wrap gap-3 text-xs text-neutral-500">
            <span>MessageId: {{ message.MessageId }}</span>
            <span v-if="message.SentTimestamp">送信日時: {{ formatDateTime(new Date(Number(message.SentTimestamp))) }}</span>
            <span v-if="message.ApproximateReceiveCount">受信回数: {{ message.ApproximateReceiveCount }}</span>
            <span v-if="message.MessageGroupId">GroupId: {{ message.MessageGroupId }}</span>
          </div>
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            :loading="deletingId === message.MessageId"
            @click="deleteOne(message)"
          >
            削除
          </UButton>
        </div>
        <pre class="text-sm whitespace-pre-wrap break-all bg-neutral-50 dark:bg-neutral-900 p-2 rounded">{{ message.Body }}</pre>
      </li>
    </ul>
  </div>
</template>
