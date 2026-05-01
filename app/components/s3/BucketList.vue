<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { S3Bucket } from '~~/shared/model/s3'

const _props = defineProps<{
  buckets: S3Bucket[]
  loading: boolean
}>()

const columns: TableColumn<S3Bucket>[] = [
  { accessorKey: 'Name', header: 'バケット名' },
  { accessorKey: 'CreationDate', header: '作成日時' },
]
</script>

<template>
  <UTable
    :data="buckets ?? []"
    :columns="columns"
    :loading="loading"
    :empty-state="{ icon: 'i-lucide-database', label: 'バケットがありません' }"
  />
</template>
