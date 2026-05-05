<script setup lang="ts">
const { data: tables, status, error, refresh } = await useFetch('/api/dynamodb/tables')
</script>

<template>
  <div>
    <div class="flex gap-3">
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
      title="テーブル一覧の取得に失敗しました"
      :description="error.message"
    />
    <DynamodbTableList
      v-else
      :tables="tables ?? []"
      :loading="status === 'pending'"
    />
  </div>
</template>
