<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { S3Object } from '~~/shared/model/s3'

defineProps<{
  bucketName: string
  objectKeys: string[]
  objects: S3Object[]
  loading: boolean
}>()

const columns: TableColumn<S3Object>[] = [
  { accessorKey: 'DisplayObjectName', header: 'オブジェクト名' },
  { accessorKey: 'Size', header: 'サイズ' },
  { accessorKey: 'LastModified', header: '最終更新日時' },
]

function formatSize(size: number | undefined) {
  if (size === undefined) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`
}
</script>

<template>
  <UTable
    :data="objects"
    :columns="columns"
    :loading="loading"
    :empty-state="{ icon: 'i-lucide-file', label: 'オブジェクトがありません' }"
  >
    <template #DisplayObjectName-cell="{ row }">
      <RouterLink
        v-if="row.original.Type === 'folder'"
        :to="{
          name: 's3-bucketName-objectKeys',
          params: {
            bucketName,
            objectKeys: [...objectKeys, row.original.DisplayObjectName ?? ''],
          },
        }"
        class="flex items-center gap-2"
      >
        <UIcon name="i-lucide-folder" />
        {{ row.original.DisplayObjectName }}
      </RouterLink>
      <span
        v-else
        class="flex items-center gap-2"
      >
        <UIcon name="i-lucide-file" />
        {{ row.original.DisplayObjectName }}
      </span>
    </template>
    <template #Size-cell="{ row }">
      {{ row.original.Type === 'folder' ? '' : formatSize(row.original.Size) }}
    </template>
  </UTable>
</template>
