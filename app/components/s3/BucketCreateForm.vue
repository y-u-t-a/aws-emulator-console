<script setup lang="ts">
import type { CreateS3BucketApiRequest } from '#shared/model/s3'

const emits = defineEmits<{
  created: [bucketName: string]
}>()

const toast = useToast()

const isOpen = ref(false)
const bucketName = ref('')
const submitting = ref(false)
const trimmedBucketName = computed(() => bucketName.value.trim())
const canCreate = computed(() => trimmedBucketName.value.length > 0)

const openCreateForm = () => {
  bucketName.value = ''
  isOpen.value = true
}

const submitCreate = async () => {
  if (!canCreate.value) return

  const name = trimmedBucketName.value
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
      <UForm @submit.prevent="submitCreate">
        <UFormField
          label="バケット名"
          name="name"
          help="3〜63文字の英小文字・数字・ハイフン・ピリオド"
          required
        >
          <UInput
            v-model="bucketName"
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
            :disabled="!canCreate"
          >
            作成
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
