<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { S3Object } from '~~/shared/model/s3'

const props = defineProps<{
  bucketName: string
  objectKeys: string[]
  objects: S3Object[]
  loading: boolean
}>()

const selected = defineModel<S3Object[]>('selected', { default: () => [] })

const { rowSelection } = useTableSelection(() => props.objects, item => item.Key, selected)

const columns: TableColumn<S3Object>[] = [
  createSelectColumn<S3Object>(),
  { accessorKey: 'DisplayObjectName', header: 'オブジェクト名' },
  { accessorKey: 'Size', header: 'サイズ' },
  { accessorKey: 'LastModified', header: '最終更新日時' },
  { id: 'actions' },
]

const downloadUrl = (object: S3Object) => {
  const encodedKey = object.Key.split('/').map(encodeURIComponent).join('/')
  return `/api/s3/${encodeURIComponent(object.Bucket)}/objects/download/${encodedKey}`
}
</script>

<template>
  <UTable
    v-model:row-selection="rowSelection"
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
        {{ row.original.DisplayObjectName }}/
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
    <template #actions-cell="{ row }">
      <UButton
        v-if="row.original.Type === 'file'"
        :to="downloadUrl(row.original)"
        external
        download
        icon="i-lucide-download"
        color="neutral"
        variant="ghost"
        size="xs"
        aria-label="ダウンロード"
      />
    </template>
  </UTable>
</template>
