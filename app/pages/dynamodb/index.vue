<script setup lang="ts">
import type { DynamoDbTable } from '~~/shared/model/dynamodb'

const { data: tables, status, error, refresh } = await useFetch('/api/dynamodb/tables')
const selected = shallowRef<DynamoDbTable[]>([])
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
      <DynamodbTableCreateForm @created="refresh()" />
      <DynamodbTableDeleteButton
        :tables="selected"
        @deleted="selected = []; refresh()"
      />
    </div>
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="テーブル一覧の取得に失敗しました"
      :description="error.message"
    />
    <DynamodbTableList
      v-else
      v-model:selected="selected"
      :tables="tables ?? []"
      :loading="status === 'pending'"
    />
  </div>
</template>
