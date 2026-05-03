<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import { sendSqsMessageApiRequestSchema } from '#shared/schema/sqs'
import type { SendSqsMessageApiRequest } from '#shared/model/sqs'

const props = defineProps<{
  queueName: string
  fifo: boolean
  contentBasedDeduplication: boolean
}>()

const emits = defineEmits<{
  sent: [messageId: string]
}>()

const toast = useToast()

const isOpen = ref(false)
const state = reactive<SendSqsMessageApiRequest>({
  body: '',
  messageGroupId: '',
  messageDeduplicationId: '',
})
const submitting = ref(false)
const formRef = useTemplateRef<Form<SendSqsMessageApiRequest>>('form')
const isValid = computed(() => formRef.value?.getErrors().length === 0)

const needsDeduplicationId = computed(() => props.fifo && !props.contentBasedDeduplication)

function openForm() {
  state.body = ''
  state.messageGroupId = ''
  state.messageDeduplicationId = ''
  isOpen.value = true
}

async function submitSend(event: FormSubmitEvent<SendSqsMessageApiRequest>) {
  const { body, messageGroupId, messageDeduplicationId } = event.data
  submitting.value = true
  try {
    const response = await $fetch(`/api/sqs/${props.queueName}/messages`, {
      method: 'POST',
      body: {
        body,
        messageGroupId: props.fifo ? messageGroupId : undefined,
        messageDeduplicationId: needsDeduplicationId.value ? messageDeduplicationId : undefined,
      } satisfies SendSqsMessageApiRequest,
    })
    toast.add({ title: 'メッセージを送信しました', description: response.MessageId, color: 'success' })
    isOpen.value = false
    emits('sent', response.MessageId)
  } catch (e) {
    toast.add({
      title: 'メッセージの送信に失敗しました',
      description: e instanceof Error ? e.message : undefined,
      color: 'error',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <UButton
    icon="i-lucide-send"
    color="primary"
    @click="openForm"
  >
    メッセージ送信
  </UButton>
  <UModal
    v-model:open="isOpen"
    title="メッセージ送信"
  >
    <template #body>
      <UForm
        ref="form"
        :schema="sendSqsMessageApiRequestSchema"
        :state="state"
        @submit="submitSend"
      >
        <UFormField
          label="メッセージ本文"
          name="body"
          required
        >
          <UTextarea
            v-model="state.body"
            :rows="6"
            class="w-full"
            autofocus
          />
        </UFormField>
        <UFormField
          v-if="fifo"
          label="MessageGroupId"
          name="messageGroupId"
          help="FIFOキューでは同一グループ内で順序が保証されます"
          required
        >
          <UInput
            v-model="state.messageGroupId"
            placeholder="group-1"
            class="w-full"
          />
        </UFormField>
        <UFormField
          v-if="needsDeduplicationId"
          label="MessageDeduplicationId"
          name="messageDeduplicationId"
          help="5分以内に同じIDのメッセージは重複として無視されます"
          required
        >
          <UInput
            v-model="state.messageDeduplicationId"
            placeholder="dedup-1"
            class="w-full"
          />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            @click="isOpen = false"
          >
            キャンセル
          </UButton>
          <UButton
            type="submit"
            color="primary"
            :loading="submitting"
            :disabled="!isValid"
          >
            送信
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
