<script setup lang="ts">
import type { DynamoDbItem } from '~~/shared/model/dynamodb'
import type { KeyType } from '@aws-sdk/client-dynamodb'

const props = defineProps<{
  tableName: string
  items: DynamoDbItem[]
  keySchema: { AttributeName: string, KeyType?: KeyType }[]
}>()

const emits = defineEmits<{
  deleted: []
}>()

const toast = useToast()
const isOpen = ref(false)
const submitting = ref(false)
const canDelete = computed(() => props.items.length > 0)

function extractKey(item: DynamoDbItem): Record<string, string | number> {
  return Object.fromEntries(
    props.keySchema
      .map(k => [k.AttributeName, item[k.AttributeName] as string | number])
      .filter(([, v]) => v !== undefined && v !== null),
  )
}

function itemLabel(item: DynamoDbItem): string {
  return Object.values(extractKey(item)).join(' / ')
}

async function submitDelete() {
  submitting.value = true
  try {
    await $fetch(`/api/dynamodb/${props.tableName}/items`, {
      method: 'DELETE',
      body: { keys: props.items.map(extractKey) },
    })
    toast.add({
      title: 'アイテムを削除しました',
      description: `${props.items.length} 件`,
      color: 'success',
    })
    isOpen.value = false
    emits('deleted')
  } catch (e) {
    toast.add({
      title: 'アイテムの削除に失敗しました',
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
    削除
  </UButton>
  <UModal
    v-model:open="isOpen"
    title="アイテム削除"
  >
    <template #body>
      <p class="mb-4">
        以下のアイテムを削除します。よろしいですか？
      </p>
      <ul class="mb-4 list-disc pl-6 text-sm">
        <li
          v-for="item in items"
          :key="itemLabel(item)"
        >
          {{ itemLabel(item) }}
        </li>
      </ul>
      <div class="flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          @click="isOpen = false"
        >
          キャンセル
        </UButton>
        <UButton
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
