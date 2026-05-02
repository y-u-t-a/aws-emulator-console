<script setup lang="ts">
const route = useRoute('s3-bucketName-objectKeys')

const objectKeys = computed(() => {
  const keys = route.params.objectKeys
  if (!keys) return []
  return Array.isArray(keys) ? keys : [keys]
})
const prefix = computed(() => objectKeys.value.join('/'))

const { data: objects, status, error, refresh } = await useFetch(
  () => objectKeys.value.length === 0
    ? `/api/s3/${route.params.bucketName}/objects`
    : `/api/s3/${route.params.bucketName}/objects/${prefix.value}`,
)
</script>

<template>
  <div>
    <div class="mb-3 flex items-center gap-3">
      <h1 class="text-lg font-semibold">
        {{ route.params.bucketName }}{{ prefix ? ` / ${prefix}` : '' }}
      </h1>
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
