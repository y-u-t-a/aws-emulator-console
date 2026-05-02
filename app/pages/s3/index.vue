<script setup lang="ts">
import type { S3Bucket } from '~~/shared/model/s3'

const { data: buckets, status, error, refresh } = await useFetch('/api/s3/buckets')
const selected = shallowRef<S3Bucket[]>([])
</script>

<template>
  <div>
    <div class="flex gap-3">
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="outline"
        :loading="status === 'pending'"
        @click="selected = []; refresh()"
      >
        再読み込み
      </UButton>
      <S3BucketCreateForm @created="refresh()" />
    </div>
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="バケット一覧の取得に失敗しました"
      :description="error.message"
    />
    <S3BucketList
      v-else
      v-model:selected="selected"
      :buckets="buckets ?? []"
      :loading="status === 'pending'"
    />
    {{ selected }}
  </div>
</template>
