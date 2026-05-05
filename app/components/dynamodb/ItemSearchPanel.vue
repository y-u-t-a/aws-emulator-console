<script setup lang="ts">
import type { DynamoDbTableDetail } from '~~/shared/model/dynamodb'

const props = defineProps<{
  tableName: string
  table: DynamoDbTableDetail | null
}>()

const partitionKeyName = computed(() =>
  props.table?.KeySchema.find(k => k.KeyType === 'HASH')?.AttributeName ?? '',
)
const sortKeyName = computed(() =>
  props.table?.KeySchema.find(k => k.KeyType === 'RANGE')?.AttributeName,
)
const keySchema = computed(() => props.table?.KeySchema ?? [])

type Tab = 'scan' | 'query'
const activeTab = ref<Tab>('scan')
</script>

<template>
  <div>
    <UTabs
      v-model="activeTab"
      :items="[{ label: 'Scan', value: 'scan' }, { label: 'Query', value: 'query' }]"
    />
    <DynamodbItemScanPanel
      v-if="activeTab === 'scan'"
      :table-name="tableName"
      :key-schema="keySchema"
    />
    <DynamodbItemQueryPanel
      v-else
      :table-name="tableName"
      :partition-key-name="partitionKeyName"
      :sort-key-name="sortKeyName"
      :key-schema="keySchema"
    />
  </div>
</template>
