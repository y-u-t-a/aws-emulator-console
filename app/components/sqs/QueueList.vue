<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { SqsQueue } from '~~/shared/model/sqs'

const props = defineProps<{
  queues: SqsQueue[]
  loading: boolean
}>()

const selected = defineModel<SqsQueue[]>('selected', { default: () => [] })

const { rowSelection } = useTableSelection(() => props.queues, item => item.Name, selected)

const columns: TableColumn<SqsQueue>[] = [
  createSelectColumn<SqsQueue>(),
  { accessorKey: 'Name', header: 'キュー名' },
  { accessorKey: 'Type', header: 'タイプ' },
  { accessorKey: 'Url', header: 'URL' },
]
</script>

<template>
  <UTable
    v-model:row-selection="rowSelection"
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
