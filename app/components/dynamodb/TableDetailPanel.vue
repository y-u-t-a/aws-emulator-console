<script setup lang="ts">
import type { DynamoDbTableDetail } from '~~/shared/model/dynamodb'

defineProps<{
  table: DynamoDbTableDetail | null
  loading: boolean
}>()

defineEmits<{
  refresh: []
}>()
</script>

<template>
  <div class="border border-neutral-200 dark:border-neutral-800 rounded-md p-4">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold">
        テーブル情報
      </h2>
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="outline"
        size="sm"
        :loading="loading"
        @click="$emit('refresh')"
      >
        再読み込み
      </UButton>
    </div>
    <dl
      v-if="table"
      class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm"
    >
      <dt>ステータス</dt>
      <dd>
        <UBadge
          :color="table.Status === 'ACTIVE' ? 'success' : 'neutral'"
          variant="subtle"
        >
          {{ table.Status }}
        </UBadge>
      </dd>
      <dt>アイテム数</dt>
      <dd>{{ table.ItemCount.toLocaleString() }}</dd>
      <dt>サイズ</dt>
      <dd>{{ table.SizeBytes.toLocaleString() }} B</dd>
      <dt>キースキーマ</dt>
      <dd>
        <span
          v-for="key in table.KeySchema"
          :key="key.AttributeName"
          class="mr-3"
        >
          <UBadge
            :color="key.KeyType === 'HASH' ? 'primary' : 'secondary'"
            variant="outline"
            class="mr-1"
          >
            {{ key.KeyType }}
          </UBadge>{{ key.AttributeName }}
        </span>
      </dd>
      <dt>ARN</dt>
      <dd class="break-all font-mono text-xs">
        {{ table.Arn }}
      </dd>
      <template v-if="table.CreatedAt">
        <dt>作成日時</dt>
        <dd>{{ new Date(table.CreatedAt).toLocaleString('ja-JP') }}</dd>
      </template>
      <template v-if="table.GlobalSecondaryIndexes.length > 0">
        <dt>GSI</dt>
        <dd>
          <div
            v-for="gsi in table.GlobalSecondaryIndexes"
            :key="gsi.IndexName"
            class="mb-1"
          >
            <span class="font-medium">{{ gsi.IndexName }}</span>
            <span class="ml-2 text-neutral-500">({{ gsi.ItemCount.toLocaleString() }} items)</span>
            <span
              v-for="key in gsi.KeySchema"
              :key="key.AttributeName"
              class="ml-2"
            >
              <UBadge
                :color="key.KeyType === 'HASH' ? 'primary' : 'secondary'"
                variant="outline"
                class="mr-1"
              >
                {{ key.KeyType }}
              </UBadge>{{ key.AttributeName }}
            </span>
          </div>
        </dd>
      </template>
    </dl>
  </div>
</template>
