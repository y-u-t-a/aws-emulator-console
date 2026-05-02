<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

const route = useRoute('s3-bucketName-objectKeys')

const objectKeys = computed(() => {
  const keys = route.params.objectKeys
  return Array.isArray(keys) ? keys : []
})

const bread = computed<BreadcrumbItem[]>(() => [
  {
    label: route.params.bucketName,
    to: {
      name: 's3-bucketName-objectKeys',
      params: {
        bucketName: route.params.bucketName,
        objectKeys: [],
      },
    },
  },
  ...objectKeys.value.map<BreadcrumbItem>((obj, index) => ({
    label: obj,
    to: {
      name: 's3-bucketName-objectKeys',
      params: {
        bucketName: route.params.bucketName,
        objectKeys: objectKeys.value.slice(0, index + 1),
      },
    },
  })),
])

const { data: objects, status, error, refresh } = await useFetch(
  () => objectKeys.value.length === 0
    ? `/api/s3/${route.params.bucketName}/objects`
    : `/api/s3/${route.params.bucketName}/objects/${objectKeys.value.join('/')}`,
)
</script>

<template>
  <div>
    <UBreadcrumb
      :items="bread"
      class="mb-3"
    />
    <div class="flex items-center gap-3">
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="outline"
        :loading="status === 'pending'"
        @click="refresh()"
      >
        再読み込み
      </UButton>
    </div>
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="オブジェクト一覧の取得に失敗しました"
      :description="error.message"
    />
    <S3ObjectList
      v-else
      :bucket-name="route.params.bucketName"
      :object-keys="objectKeys"
      :objects="objects ?? []"
      :loading="status === 'pending'"
    />
  </div>
</template>
