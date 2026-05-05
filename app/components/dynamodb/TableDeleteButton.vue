<script setup lang="ts">
import type { DynamoDbTable, DeleteDynamoDbTablesApiRequest } from '#shared/model/dynamodb'

const props = defineProps<{
  tables: DynamoDbTable[]
}>()

const emits = defineEmits<{
  deleted: []
}>()

const toast = useToast()

const isOpen = ref(false)
const submitting = ref(false)
const canDelete = computed(() => props.tables.length > 0)

const submitDelete = async () => {
  if (!canDelete.value) return

  const names = props.tables.map(t => t.Name)
  submitting.value = true
  try {
    await $fetch('/api/dynamodb/tables', {
      method: 'DELETE',
      body: { names } satisfies DeleteDynamoDbTablesApiRequest,
    })
    toast.add({
      title: 'テーブルを削除しました',
      description: names.join(', '),
      color: 'success',
    })
    isOpen.value = false
    emits('deleted')
  } catch (e) {
    toast.add({
      title: 'テーブルの削除に失敗しました',
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
    @click="isOpen = true"
  >
    テーブル削除
  </UButton>
  <UModal
    v-model:open="isOpen"
    title="DynamoDB テーブル削除"
  >
    <template #body>
      <p class="mb-4">
        以下のテーブルを削除します。テーブル内のアイテムもすべて失われます。よろしいですか？
      </p>
      <ul class="mb-4 list-disc pl-6">
        <li
          v-for="table in tables"
          :key="table.Name"
        >
          {{ table.Name }}
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
          @click="submitDelete"
        >
          削除
        </UButton>
      </div>
    </template>
  </UModal>
</template>
