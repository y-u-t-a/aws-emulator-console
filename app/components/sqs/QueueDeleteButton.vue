<script setup lang="ts">
import type { SqsQueue, DeleteSqsQueuesApiRequest } from '#shared/model/sqs'

const props = defineProps<{
  queues: SqsQueue[]
}>()

const emits = defineEmits<{
  deleted: []
}>()

const toast = useToast()

const isOpen = ref(false)
const submitting = ref(false)
const canDelete = computed(() => props.queues.length > 0)

const openDeleteForm = () => {
  isOpen.value = true
}

const submitDelete = async () => {
  if (!canDelete.value) return

  const names = props.queues.map(queue => queue.Name)
  submitting.value = true
  try {
    await $fetch('/api/sqs/queues', {
      method: 'DELETE',
      body: { names } satisfies DeleteSqsQueuesApiRequest,
    })
    toast.add({
      title: 'キューを削除しました',
      description: names.join(', '),
      color: 'success',
    })
    isOpen.value = false
    emits('deleted')
  } catch (e) {
    toast.add({
      title: 'キューの削除に失敗しました',
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
    キュー削除
  </UButton>
  <UModal
    v-model:open="isOpen"
    title="SQSキュー削除"
  >
    <template #body>
      <p class="mb-4">
        以下のキューを削除します。キュー内のメッセージもすべて失われます。よろしいですか？
      </p>
      <ul class="mb-4 list-disc pl-6">
        <li
          v-for="queue in queues"
          :key="queue.Name"
        >
          {{ queue.Name }}
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
