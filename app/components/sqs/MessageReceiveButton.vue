<script setup lang="ts">
import type { ReceiveSqsMessagesApiRequest, SqsMessage } from '#shared/model/sqs'

const props = defineProps<{
  queueName: string
}>()

const emits = defineEmits<{
  received: [messages: SqsMessage[]]
}>()

const toast = useToast()
const submitting = ref(false)
const maxNumberOfMessages = ref(10)

async function receive() {
  submitting.value = true
  try {
    const response = await $fetch<SqsMessage[]>(`/api/sqs/${props.queueName}/messages`, {
      method: 'PUT',
      body: { maxNumberOfMessages: maxNumberOfMessages.value } satisfies ReceiveSqsMessagesApiRequest,
    })
    if (response.length === 0) {
      toast.add({ title: '受信できるメッセージはありませんでした', color: 'info' })
    } else {
      toast.add({ title: `${response.length} 件のメッセージを受信しました`, color: 'success' })
    }
    emits('received', response)
  } catch (e) {
    toast.add({
      title: 'メッセージの受信に失敗しました',
      description: e instanceof Error ? e.message : undefined,
      color: 'error',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
      icon="i-lucide-inbox"
      color="primary"
      variant="outline"
      :loading="submitting"
      @click="receive"
    >
      メッセージ受信
    </UButton>
    <UInputNumber
      v-model="maxNumberOfMessages"
      :min="1"
      :max="10"
      class="w-24"
    />
    <span class="text-sm text-neutral-500">件まで</span>
  </div>
</template>
