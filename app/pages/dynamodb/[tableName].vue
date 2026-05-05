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
  <div>
    <UBreadcrumb
      :items="bread"
      class="mb-3"
    />
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
      <DynamodbItemSearchPanel
        :table-name="tableName"
        :table="table ?? null"
      />
    </template>
  </div>
</template>
