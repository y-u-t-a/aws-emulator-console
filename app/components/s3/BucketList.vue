<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { S3Bucket } from '~~/shared/model/s3'

const props = defineProps<{
  buckets: S3Bucket[]
  loading: boolean
}>()

const selected = defineModel<S3Bucket[]>('selected', { default: () => [] })

const { rowSelection } = useTableSelection(() => props.buckets, item => item.Name, selected)

const columns: TableColumn<S3Bucket>[] = [
  createSelectColumn<S3Bucket>(),
  { accessorKey: 'Name', header: 'バケット名' },
  { accessorKey: 'CreationDate', header: '作成日時' },
]
</script>

<template>
  <UTable
    v-model:row-selection="rowSelection"
    :data="buckets ?? []"
    :columns="columns"
    :loading="loading"
    :empty-state="{ icon: 'i-lucide-database', label: 'バケットがありません' }"
  >
    <template #Name-cell="{ getValue }">
      <RouterLink :to="{ name: 's3-bucketName', params: { bucketName: getValue<string>() } }">
        {{ getValue() }}
      </RouterLink>
    </template>
  </UTable>
</template>
