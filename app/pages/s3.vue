<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { S3Bucket } from '#shared/model/s3'

const { data: buckets, status, error, refresh } = await useFetch('/api/s3/buckets')

const columns: TableColumn<S3Bucket>[] = [
  { accessorKey: 'Name', header: 'バケット名' },
  { accessorKey: 'CreationDate', header: '作成日時' },
]
</script>

<template>
  <UPage>
    <UPageHeader
      title="S3 バケット"
      description="S3 エミュレーター上のバケット一覧"
    >
      <template #links>
        <UButton
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="outline"
          :loading="status === 'pending'"
          @click="refresh()"
        >
          再読み込み
        </UButton>
        <S3BucketCreateForm @created="() => refresh()" />
      </template>
    </UPageHeader>

    <UPageBody>
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="バケット一覧の取得に失敗しました"
        :description="error.message"
      />
      <UTable
        v-else
        :data="buckets ?? []"
        :columns="columns"
        :loading="status === 'pending'"
        :empty-state="{ icon: 'i-lucide-database', label: 'バケットがありません' }"
      />
    </UPageBody>
  </UPage>
</template>
