<script setup lang="ts">
import type { S3Object, DeleteS3ObjectsApiRequest } from '#shared/model/s3'

const props = defineProps<{
  bucketName: string
  objects: S3Object[]
}>()

const emits = defineEmits<{
  deleted: []
}>()

const toast = useToast()

const isOpen = ref(false)
const submitting = ref(false)
const canDelete = computed(() => props.objects.length > 0)

const openDeleteForm = () => {
  isOpen.value = true
}

const submitDelete = async () => {
  if (!canDelete.value) return

  const keys = props.objects.map(object => object.Key)
  submitting.value = true
  try {
    await $fetch(`/api/s3/${props.bucketName}/objects` as '/api/s3/:bucketName/objects', {
      method: 'DELETE',
      body: { keys } satisfies DeleteS3ObjectsApiRequest,
    })
    toast.add({
      title: 'オブジェクトを削除しました',
      description: keys.join(', '),
      color: 'success',
    })
    isOpen.value = false
    emits('deleted')
  } catch (e) {
    toast.add({
      title: 'オブジェクトの削除に失敗しました',
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
    オブジェクト削除
  </UButton>
  <UModal
    v-model:open="isOpen"
    title="S3オブジェクト削除"
  >
    <template #body>
      <p class="mb-4">
        以下のオブジェクトを削除します。フォルダの場合は配下のオブジェクトもすべて削除されます。よろしいですか？
      </p>
      <ul class="mb-4 list-disc pl-6">
        <li
          v-for="object in objects"
          :key="object.Key"
        >
          {{ object.Key }}
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
