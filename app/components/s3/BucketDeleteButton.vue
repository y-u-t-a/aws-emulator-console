<script setup lang="ts">
import type { S3Bucket, DeleteS3BucketsApiRequest } from '#shared/model/s3'

const props = defineProps<{
  buckets: S3Bucket[]
}>()

const emits = defineEmits<{
  deleted: []
}>()

const toast = useToast()

const isOpen = ref(false)
const submitting = ref(false)
const canDelete = computed(() => props.buckets.length > 0)

const openDeleteForm = () => {
  isOpen.value = true
}

const submitDelete = async () => {
  if (!canDelete.value) return

  const names = props.buckets.map(bucket => bucket.Name)
  submitting.value = true
  try {
    await $fetch('/api/s3/buckets', {
      method: 'DELETE',
      body: { names } satisfies DeleteS3BucketsApiRequest,
    })
    toast.add({
      title: 'バケットを削除しました',
      description: names.join(', '),
      color: 'success',
    })
    isOpen.value = false
    emits('deleted')
  } catch (e) {
    toast.add({
      title: 'バケットの削除に失敗しました',
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
    icon="i-lucide-trash-2"
    color="error"
    variant="outline"
    :disabled="!canDelete"
    @click="openDeleteForm"
  >
    バケット削除
  </UButton>
  <UModal
    v-model:open="isOpen"
    title="S3バケット削除"
  >
    <template #body>
      <p class="mb-4">
        以下のバケットを削除します。バケット内のオブジェクトもすべて削除されます。よろしいですか？
      </p>
      <ul class="mb-4 list-disc pl-6">
        <li
          v-for="bucket in buckets"
          :key="bucket.Name"
        >
          {{ bucket.Name }}
        </li>
      </ul>
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
          type="button"
          color="error"
          :loading="submitting"
          :disabled="!canDelete"
          @click="submitDelete"
        >
          削除
        </UButton>
      </div>
    </template>
  </UModal>
</template>
