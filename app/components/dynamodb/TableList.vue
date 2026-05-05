<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { DynamoDbTable } from '~~/shared/model/dynamodb'

defineProps<{
  tables: DynamoDbTable[]
  loading: boolean
}>()

const columns: TableColumn<DynamoDbTable>[] = [
  { accessorKey: 'Name', header: 'テーブル名' },
  { accessorKey: 'Status', header: 'ステータス' },
  { accessorKey: 'ItemCount', header: 'アイテム数' },
  { accessorKey: 'SizeBytes', header: 'サイズ' },
  { accessorKey: 'KeySchema', header: 'キースキーマ' },
]
</script>

<template>
  <UTable
    :data="tables"
    :columns="columns"
    :loading="loading"
    :empty-state="{ icon: 'i-lucide-database', label: 'テーブルがありません' }"
  >
    <template #Status-cell="{ row }">
      <UBadge
        :color="row.original.Status === 'ACTIVE' ? 'success' : 'neutral'"
        variant="subtle"
      >
        {{ row.original.Status }}
      </UBadge>
    </template>
    <template #SizeBytes-cell="{ row }">
      {{ row.original.SizeBytes.toLocaleString() }} B
    </template>
    <template #KeySchema-cell="{ row }">
      <span
        v-for="key in row.original.KeySchema"
        :key="key.AttributeName"
        class="mr-2"
      >
        <UBadge
          :color="key.KeyType === 'HASH' ? 'primary' : 'secondary'"
          variant="outline"
          class="mr-1"
        >
          {{ key.KeyType }}
        </UBadge>{{ key.AttributeName }}
      </span>
    </template>
  </UTable>
</template>
