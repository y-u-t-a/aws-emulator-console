<script setup lang="ts">
import type { SqsQueue, PurgeSqsQueuesApiRequest } from '#shared/model/sqs'

const props = defineProps<{
  queues: SqsQueue[]
}>()

const emits = defineEmits<{
  purged: []
}>()

const toast = useToast()

const isOpen = ref(false)
const submitting = ref(false)
const canPurge = computed(() => props.queues.length > 0)

const openPurgeForm = () => {
  isOpen.value = true
}

const submitPurge = async () => {
  if (!canPurge.value) return

  const names = props.queues.map(queue => queue.Name)
  submitting.value = true
  try {
    await $fetch('/api/sqs/queues', {
      method: 'PATCH',
      body: { names } satisfies PurgeSqsQueuesApiRequest,
    })
    toast.add({
      title: 'メッセージをクリアしました',
      description: names.join(', '),
      color: 'success',
    })
    isOpen.value = false
    emits('purged')
  } catch (e) {
    toast.add({
      title: 'メッセージのクリアに失敗しました',
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
    icon="i-lucide-eraser"
    color="warning"
    variant="outline"
    :disabled="!canPurge"
    @click="openPurgeForm"
  >
    メッセージクリア
  </UButton>
  <UModal
    v-model:open="isOpen"
    title="SQSキューのメッセージクリア"
  >
    <template #body>
      <p class="mb-4">
        以下のキューのメッセージをすべて削除します。処理中のメッセージも消えます。よろしいですか？
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
          color="warning"
          :loading="submitting"
          :disabled="!canPurge"
          @click="submitPurge"
        >
          クリア
        </UButton>
      </div>
    </template>
  </UModal>
</template>
