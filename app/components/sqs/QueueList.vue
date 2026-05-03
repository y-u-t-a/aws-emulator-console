<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { SqsQueue } from '~~/shared/model/sqs'

defineProps<{
  queues: SqsQueue[]
  loading: boolean
}>()

const columns: TableColumn<SqsQueue>[] = [
  { accessorKey: 'Name', header: 'キュー名' },
  { accessorKey: 'Type', header: 'タイプ' },
  { accessorKey: 'Url', header: 'URL' },
]
</script>

<template>
  <UTable
    :data="queues ?? []"
    :columns="columns"
    :loading="loading"
    :empty-state="{ icon: 'i-lucide-inbox', label: 'キューがありません' }"
  >
    <template #Name-cell="{ row }">
      <RouterLink :to="{ name: 'sqs-queueName', params: { queueName: row.original.Name } }">
        {{ row.original.Name }}
      </RouterLink>
    </template>
    <template #Type-cell="{ row }">
      <UBadge
        :color="row.original.Type === 'fifo' ? 'primary' : 'neutral'"
        variant="subtle"
      >
        {{ row.original.Type === 'fifo' ? 'FIFO' : 'Standard' }}
      </UBadge>
    </template>
  </UTable>
</template>
