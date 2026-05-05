<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { DynamoDbTableDetail } from '~~/shared/model/dynamodb'

const route = useRoute('dynamodb-tableName')
const tableName = computed(() => route.params.tableName)

const { data: table, status, error, refresh } = await useFetch<DynamoDbTableDetail>(
  () => `/api/dynamodb/${tableName.value}`,
)

const bread = computed<BreadcrumbItem[]>(() => [
  { label: 'テーブル', to: { name: 'dynamodb' } },
  { label: tableName.value, to: { name: 'dynamodb-tableName', params: { tableName: tableName.value } } },
])
</script>

<template>
  <div class="flex flex-col gap-3">
    <UBreadcrumb :items="bread" />
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="テーブル情報の取得に失敗しました"
      :description="error.message"
    />
    <template v-else>
      <DynamodbTableDetailPanel
        :table="table ?? null"
        :loading="status === 'pending'"
        @refresh="refresh()"
      />
      <div class="flex gap-3">
        <UButton
          icon="i-lucide-plus"
          color="primary"
          :to="{ name: 'dynamodb-tableName-items-new', params: { tableName } }"
        >
          アイテム作成
        </UButton>
      </div>
      <DynamodbItemSearchPanel
        :table-name="tableName"
        :table="table ?? null"
      />
    </template>
  </div>
</template>
