<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import { createSqsQueueApiRequestSchema } from '#shared/schema/sqs'
import type { CreateSqsQueueApiRequest } from '#shared/model/sqs'

const emits = defineEmits<{
  created: [queueName: string]
}>()

const toast = useToast()

const isOpen = ref(false)
const state = reactive<CreateSqsQueueApiRequest>({
  name: '',
  fifo: false,
  contentBasedDeduplication: false,
})
const submitting = ref(false)
const formRef = useTemplateRef<Form<CreateSqsQueueApiRequest>>('form')
const isValid = computed(() => formRef.value?.getErrors().length === 0)

function openCreateForm() {
  state.name = ''
  state.fifo = false
  state.contentBasedDeduplication = false
  isOpen.value = true
}

async function submitCreate(event: FormSubmitEvent<CreateSqsQueueApiRequest>) {
  const { name, fifo, contentBasedDeduplication } = event.data
  submitting.value = true
  try {
    await $fetch('/api/sqs/queues', {
      method: 'POST',
      body: {
        name,
        fifo,
        contentBasedDeduplication: fifo ? contentBasedDeduplication : false,
      } satisfies CreateSqsQueueApiRequest,
    })
    toast.add({ title: 'キューを作成しました', description: name, color: 'success' })
    isOpen.value = false
    emits('created', name)
  } catch (e) {
    toast.add({
      title: 'キューの作成に失敗しました',
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
    icon="i-lucide-plus"
    color="primary"
    @click="openCreateForm"
  >
    キュー作成
  </UButton>
  <UModal
    v-model:open="isOpen"
    title="SQSキュー作成"
  >
    <template #body>
      <UForm
        ref="form"
        :schema="createSqsQueueApiRequestSchema"
        :state="state"
        @submit="submitCreate"
      >
        <UFormField
          label="キュー名"
          name="name"
          :help="state.fifo ? '英数字・ハイフン・アンダースコアで、末尾に \&quot;.fifo\&quot; が必要です' : '80文字以内の英数字・ハイフン・アンダースコア'"
          required
        >
          <UInput
            v-model="state.name"
            :placeholder="state.fifo ? 'my-queue.fifo' : 'my-queue'"
            autofocus
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="キュータイプ"
          name="fifo"
        >
          <URadioGroup
            v-model="state.fifo"
            :items="[
              { label: 'Standard', value: false },
              { label: 'FIFO', value: true },
            ]"
          />
        </UFormField>
        <UFormField
          v-if="state.fifo"
          label="コンテンツベースの重複排除"
          name="contentBasedDeduplication"
        >
          <UCheckbox
            v-model="state.contentBasedDeduplication"
            label="メッセージ本文から重複排除IDを生成する"
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
            作成
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
