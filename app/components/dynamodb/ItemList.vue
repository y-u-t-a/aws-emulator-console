<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { DynamoDbItem } from '~~/shared/model/dynamodb'
import type { KeyType } from '@aws-sdk/client-dynamodb'

const props = defineProps<{
  items: DynamoDbItem[]
  loading: boolean
  keySchema: { AttributeName: string, KeyType?: KeyType }[]
}>()

const selected = defineModel<DynamoDbItem[]>('selected', { default: () => [] })

const { rowSelection } = useTableSelection(
  () => props.items,
  item => JSON.stringify(extractKey(item)),
  selected,
)

function extractKey(item: DynamoDbItem): Record<string, string | number> {
  return Object.fromEntries(
    props.keySchema
      .map(k => [k.AttributeName, item[k.AttributeName] as string | number])
      .filter(([, v]) => v !== undefined && v !== null),
  )
}

const columns = computed<TableColumn<DynamoDbItem>[]>(() => {
  const keys = new Set<string>()
  for (const item of props.items) {
    for (const key of Object.keys(item)) keys.add(key)
  }
  return [
    createSelectColumn<DynamoDbItem>(),
    ...[...keys].map(key => ({ accessorKey: key, header: key })),
  ]
})
</script>

<template>
  <UTable
    v-model:row-selection="rowSelection"
    :data="items"
    :columns="columns"
    :loading="loading"
    :empty-state="{ icon: 'i-lucide-inbox', label: 'アイテムがありません' }"
    class="mt-4"
  />
</template>
