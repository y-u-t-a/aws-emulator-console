<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import { updateSqsQueueApiRequestSchema } from '#shared/schema/sqs'
import type { UpdateSqsQueueApiRequest } from '#shared/model/sqs'

const props = defineProps<{
  queueName: string
  visibilityTimeout: number
}>()

const emits = defineEmits<{
  updated: []
}>()

const toast = useToast()

const isOpen = ref(false)
const state = reactive<UpdateSqsQueueApiRequest>({
  visibilityTimeout: props.visibilityTimeout,
})
const submitting = ref(false)
const formRef = useTemplateRef<Form<UpdateSqsQueueApiRequest>>('form')
const isValid = computed(() => formRef.value?.getErrors().length === 0)

function openEditForm() {
  state.visibilityTimeout = props.visibilityTimeout
  isOpen.value = true
}

async function submitUpdate(event: FormSubmitEvent<UpdateSqsQueueApiRequest>) {
  submitting.value = true
  try {
    await $fetch(`/api/sqs/${props.queueName}`, {
      method: 'PATCH',
      body: { visibilityTimeout: event.data.visibilityTimeout } satisfies UpdateSqsQueueApiRequest,
    })
    toast.add({ title: 'キュー設定を更新しました', color: 'success' })
    isOpen.value = false
    emits('updated')
  } catch (e) {
    toast.add({
      title: 'キュー設定の更新に失敗しました',
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
    icon="i-lucide-settings-2"
    color="neutral"
    variant="outline"
    size="sm"
    @click="openEditForm"
  >
    設定変更
  </UButton>
  <UModal
    v-model:open="isOpen"
    title="SQSキュー設定変更"
  >
    <template #body>
      <UForm
        ref="form"
        :schema="updateSqsQueueApiRequestSchema"
        :state="state"
        class="flex flex-col gap-3"
        @submit="submitUpdate"
      >
        <UFormField
          label="可視性タイムアウト"
          name="visibilityTimeout"
          help="0〜43200秒（12時間）"
          required
        >
          <UInputNumber
            v-model="state.visibilityTimeout"
            :min="0"
            :max="43200"
            class="w-32"
          />
          <span class="ml-2 text-sm">秒</span>
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
            更新
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
