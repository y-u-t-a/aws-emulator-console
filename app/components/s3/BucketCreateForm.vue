<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import { createS3BucketApiRequestSchema } from '#shared/schema/s3'
import type { CreateS3BucketApiRequest } from '#shared/model/s3'

const emits = defineEmits<{
  created: [bucketName: string]
}>()

const toast = useToast()

const isOpen = ref(false)
const state = reactive<CreateS3BucketApiRequest>({
  name: '',
})
const submitting = ref(false)
const formRef = useTemplateRef<Form<CreateS3BucketApiRequest>>('form')
const isValid = computed(() => formRef.value?.getErrors().length === 0)

function openCreateForm() {
  state.name = ''
  isOpen.value = true
}

async function submitCreate(event: FormSubmitEvent<CreateS3BucketApiRequest>) {
  const { name } = event.data
  submitting.value = true
  try {
    await $fetch('/api/s3/buckets', {
      method: 'POST',
      body: { name } satisfies CreateS3BucketApiRequest,
    })
    toast.add({ title: 'バケットを作成しました', description: name, color: 'success' })
    isOpen.value = false
    emits('created', name)
  } catch (e) {
    toast.add({
      title: 'バケットの作成に失敗しました',
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
    バケット作成
  </UButton>
  <UModal
    v-model:open="isOpen"
    title="S3バケット作成"
  >
    <template #body>
      <UForm
        ref="form"
        :schema="createS3BucketApiRequestSchema"
        :state="state"
        @submit="submitCreate"
      >
        <UFormField
          label="バケット名"
          name="name"
          help="3〜63文字の英小文字・数字・ハイフン・ピリオド"
          required
        >
          <UInput
            v-model="state.name"
            placeholder="my-bucket"
            autofocus
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
            作成
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
