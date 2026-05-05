<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { DynamoDbItem } from '~~/shared/model/dynamodb'

const props = defineProps<{
  items: DynamoDbItem[]
  loading: boolean
}>()

const columns = computed<TableColumn<DynamoDbItem>[]>(() => {
  const keys = new Set<string>()
  for (const item of props.items) {
    for (const key of Object.keys(item)) keys.add(key)
  }
  return [...keys].map(key => ({ accessorKey: key, header: key }))
})
</script>

<template>
  <UTable
    :data="items"
    :columns="columns"
    :loading="loading"
    :empty-state="{ icon: 'i-lucide-inbox', label: 'アイテムがありません' }"
    class="mt-4"
  />
</template>
