<script setup lang="ts">
import type { DynamoDbItem } from '~~/shared/model/dynamodb'

const props = defineProps<{
  tableName: string
  partitionKeyName: string
  sortKeyName?: string
}>()

const partitionKeyValue = ref('')
const sortKeyValue = ref('')
const limit = ref(100)

const items = ref<DynamoDbItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const executed = ref(false)

async function execute() {
  loading.value = true
  error.value = null
  executed.value = false
  try {
    items.value = await $fetch<DynamoDbItem[]>(`/api/dynamodb/${props.tableName}/items/query`, {
      method: 'POST',
      body: {
        partitionKeyName: props.partitionKeyName,
        partitionKeyValue: partitionKeyValue.value,
        sortKeyName: props.sortKeyName || undefined,
        sortKeyValue: sortKeyValue.value || undefined,
        limit: limit.value,
      },
    })
    executed.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Query に失敗しました'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end gap-3">
      <UFormField :label="`${partitionKeyName}（パーティションキー）`">
        <UInput
          v-model="partitionKeyValue"
          :placeholder="partitionKeyName"
          class="w-48"
        />
      </UFormField>
      <UFormField
        v-if="sortKeyName"
        :label="`${sortKeyName}（ソートキー・省略可）`"
      >
        <UInput
          v-model="sortKeyValue"
          :placeholder="sortKeyName"
          class="w-48"
        />
      </UFormField>
      <UFormField label="取得件数上限">
        <UInputNumber
          v-model="limit"
          :min="1"
          :max="1000"
          class="w-28"
        />
      </UFormField>
      <UButton
        icon="i-lucide-play"
        :loading="loading"
        :disabled="!partitionKeyValue"
        @click="execute"
      >
        Query 実行
      </UButton>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="error"
      class="mt-4"
    />
    <DynamodbItemList
      v-else-if="executed"
      :items="items"
      :loading="loading"
    />
  </div>
</template>
